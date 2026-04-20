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
  width = 28,
}: BrandLogoProps): React.JSX.Element {
  const rootClassName = `flex items-center transition-opacity hover:opacity-80 ${className ?? ""}`.trim();

  return (
    <Link href={href} className={rootClassName}>
      <Image src="/icon.png" alt="BuyEase" width={width} height={width} priority unoptimized />
    </Link>
  );
}