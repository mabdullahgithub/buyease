"use client";

import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href: string;
  className?: string;
  width?: number;
};

export function BrandLogo({
  href,
  className,
  width = 160,
}: BrandLogoProps): React.JSX.Element {
  const rootClassName = `flex items-center transition-opacity hover:opacity-80 ${className ?? ""}`.trim();

  return (
    <Link href={href} className={rootClassName}>
      <Image src="/logo.png" alt="BuyEase" width={width} height={Math.round(width * 0.286)} priority unoptimized />
    </Link>
  );
}