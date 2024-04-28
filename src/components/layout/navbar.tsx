import Link from "next/link";
import styles from "./navbar.module.css";
import clsx from "clsx";

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={clsx(styles.title, styles.link)}>
        <span>9rtm</span>
        <span className={styles.tld}>.dev</span>
      </Link>
    </nav>
  );
}
