import Icon from "@/assets/icon.png";
import Image from "next/image";
import Link from "next/link";

function NavbarItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group/link flex flex-col text-base font-bold tracking-widest text-white"
    >
      {children}
      <div className="h-0.5 w-full -translate-x-1/2 scale-x-0 bg-accent transition-transform group-hover/link:translate-x-0 group-hover/link:scale-x-100" />
    </Link>
  );
}

export default function Navbar() {
  return (
    <nav className="mt-6 flex w-full flex-row content-between items-center">
      <div className="flex flex-row items-center gap-6">
        <Link href="/">
          <Image
            alt="site logo"
            src={Icon}
            width={36}
            height={36}
            className="rounded-md"
          />
        </Link>
        <div className="flex flex-row items-center gap-6">
          <NavbarItem href="/">home</NavbarItem>
          <NavbarItem href="/about">about</NavbarItem>
          <NavbarItem href="/notes">notes</NavbarItem>
        </div>
      </div>
    </nav>
  );
}
