import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "TODO: verify OTP" }, { status: 501 });
}
