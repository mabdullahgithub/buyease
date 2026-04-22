import { NextRequest, NextResponse } from "next/server";
import { Prisma, db } from "@buyease/db";
import { isCurrentRequestIpAllowed } from "@/lib/admin-ip-guard";
import { isValidAdminRole } from "@/lib/admin-access";
import { auth } from "@/lib/auth";

const MAX_PROFILE_IMAGE_BYTES = 1_000_000;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function toDataUrl(bytes: Uint8Array, mimeType: string): string {
  return `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
}

function isTransientPrismaError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2024"
  );
}

function mapProfileError(error: unknown): { status: number; message: string } | null {
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      status: 400,
      message: "Invalid profile payload. Please retry with a smaller valid image.",
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2022") {
      return {
        status: 503,
        message: "Profile fields are not available yet. Run latest database migrations.",
      };
    }
    if (error.code === "P2024") {
      return {
        status: 503,
        message: "Profile save is temporarily busy. Please try again.",
      };
    }
  }

  if (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.name === "PrismaClientRustPanicError")
  ) {
    return {
      status: 503,
      message: "Database is temporarily unavailable. Please try again.",
    };
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("can't reach database server") ||
      message.includes("failed to connect to database") ||
      message.includes("connection refused")
    ) {
      return {
        status: 503,
        message: "Database is temporarily unavailable. Please try again.",
      };
    }
  }

  return null;
}

async function getSessionAdmin() {
  const session = await auth();
  if (!session?.user?.email || !isValidAdminRole(session.user.role)) {
    return null;
  }
  if (!(await isCurrentRequestIpAllowed())) {
    return "forbidden" as const;
  }
  return session.user.email;
}

export async function GET(): Promise<NextResponse> {
  try {
    const emailOrState = await getSessionAdmin();
    if (!emailOrState) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }
    if (emailOrState === "forbidden") {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }

    const admin = await db.adminUser.findFirst({
      where: { email: emailOrState, isActive: true },
      select: {
        displayName: true,
        profileImage: true,
        profileImageMimeType: true,
      },
    });

    if (!admin) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      profile: {
        displayName: admin.displayName,
        avatarDataUrl:
          admin.profileImage && admin.profileImageMimeType
            ? toDataUrl(admin.profileImage, admin.profileImageMimeType)
            : null,
      },
    });
  } catch (error) {
    const mapped = mapProfileError(error);
    if (mapped) {
      return NextResponse.json({ ok: false, error: mapped.message }, { status: mapped.status });
    }

    process.stderr.write(
      `[admin profile GET] ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`
    );
    return NextResponse.json(
      { ok: false, error: "Unable to load profile right now." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const emailOrState = await getSessionAdmin();
    if (!emailOrState) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }
    if (emailOrState === "forbidden") {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }

    const formData = await request.formData();
    const displayNameRaw = String(formData.get("displayName") ?? "").trim();
    const removeImage = String(formData.get("removeImage") ?? "false") === "true";
    const imageFile = formData.get("image");

    if (displayNameRaw.length > 60) {
      return NextResponse.json(
        { ok: false, error: "Display name must be 60 characters or less." },
        { status: 400 }
      );
    }

    let nextImage: Buffer | null | undefined;
    let nextImageType: string | null | undefined;

    if (removeImage) {
      nextImage = null;
      nextImageType = null;
    }

    if (imageFile instanceof File && imageFile.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.has(imageFile.type)) {
        return NextResponse.json(
          { ok: false, error: "Only PNG, JPEG, and WEBP images are allowed." },
          { status: 400 }
        );
      }
      if (imageFile.size > MAX_PROFILE_IMAGE_BYTES) {
        return NextResponse.json(
          { ok: false, error: "Profile image must be smaller than 1MB." },
          { status: 400 }
        );
      }

      const arrayBuffer = await imageFile.arrayBuffer();
      nextImage = Buffer.from(arrayBuffer);
      nextImageType = imageFile.type;
    }

    const admin = await db.adminUser.findFirst({
      where: {
        email: {
          equals: emailOrState,
          mode: "insensitive",
        },
        isActive: true,
      },
      select: { id: true },
    });
    if (!admin) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    const updated = await db.adminUser.update({
      where: { id: admin.id },
      data: {
        displayName: displayNameRaw || null,
        ...(nextImage !== undefined
          ? {
              profileImage: nextImage,
              profileImageMimeType: nextImageType ?? null,
            }
          : {}),
      },
      select: {
        displayName: true,
        profileImage: true,
        profileImageMimeType: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        profile: {
          displayName: updated.displayName,
          avatarDataUrl:
            updated.profileImage && updated.profileImageMimeType
              ? toDataUrl(updated.profileImage, updated.profileImageMimeType)
              : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const mapped = mapProfileError(error);
    if (mapped) {
      return NextResponse.json({ ok: false, error: mapped.message }, { status: mapped.status });
    }

    process.stderr.write(
      `[admin profile PATCH] ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`
    );
    return NextResponse.json(
      { ok: false, error: "Unable to save profile right now." },
      { status: 500 }
    );
  }
}
