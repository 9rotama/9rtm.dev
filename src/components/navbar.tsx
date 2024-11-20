import Icon from "@/assets/icon.png";
import Image from "next/image";
import Link from "next/link";

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
          <Link
            href="/"
            className="text-base font-bold tracking-widest text-white"
          >
            home
          </Link>
          <Link
            href="/about"
            className="text-base font-bold tracking-widest text-white"
          >
            about
          </Link>
          <Link
            href="/notes"
            className="text-base font-bold tracking-widest text-white"
          >
            notes
          </Link>
        </div>
      </div>
    </nav>
  );
}
