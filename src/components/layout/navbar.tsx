import Link from "next/link";
import styles from "./navbar.module.css";
import clsx from "clsx";
import Image from "next/image";
import Icon from "@/assets/icon.png";

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.navLeft}>
        <Link href="/" className={clsx(styles.title, styles.link)}>
          <Image
            alt="site logo"
            src={Icon}
            width={36}
            height={36}
            className={styles.logo}
          />
        </Link>
        <div className={styles.links}>
          <Link href="/" className={styles.link}>
            home
          </Link>
          <Link href="/about" className={styles.link}>
            about
          </Link>
          <Link href="/" className={styles.link}>
            posts
          </Link>
        </div>
      </div>
    </nav>
  );
}
