"use client";

import Icon from "@/assets/icon.png";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavbarItem({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group/link flex flex-col text-base font-bold tracking-widest text-white"
    >
      {children}
      <div className={clsx("h-0.5 w-full bg-accent", !active && "opacity-0")} />
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="mt-6 flex w-full flex-row content-between items-center">
      <div className="flex flex-row items-center gap-6">
        <Image
          alt="site logo"
          src={Icon}
          width={36}
          height={36}
          className="rounded-md"
        />
        <div className="flex flex-row items-center gap-6">
          <NavbarItem href="/" active={pathname === "/"}>
            home
          </NavbarItem>
          <NavbarItem href="/notes" active={pathname === "/notes"}>
            notes
          </NavbarItem>
        </div>
      </div>
    </nav>
  );
}
