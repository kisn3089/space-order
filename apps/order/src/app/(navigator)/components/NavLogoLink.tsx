"use client";

import Link from "next/link";
import StoreName from "./StoreName";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function NavLogoLink() {
  const { qrCode } = useParams<{ qrCode: string }>();

  return (
    <Link href={`/${qrCode}`}>
      <div className="flex items-center gap-x-2 min-w-0">
        <Image
          src={"/logo.png"}
          alt="Logo"
          width={20}
          height={20}
          className="shrink-0"
        />
        <StoreName storeName="스페이스 카페 본점" />
      </div>
    </Link>
  );
}
