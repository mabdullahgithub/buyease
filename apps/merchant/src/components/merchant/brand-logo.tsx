"use client";

import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href: string;
  size?: number;
};

export function BrandLogo({
  href,
  size = 36,
}: BrandLogoProps): React.JSX.Element {
  return (
    <Link href={href} aria-label="BuyEase home">
      <Image
        src="/icon.png"
        alt="BuyEase"
        width={size}
        height={size}
        priority
      />
    </Link>
  );
}