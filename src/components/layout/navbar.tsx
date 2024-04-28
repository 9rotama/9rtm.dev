import Link from "next/link";
import styles from "./navbar.module.css";

export default function Navbar() {
  return (
    <nav>
      <Link href="/" className={styles.title}>
        <span>9rtm</span>
        <span className={styles.tld}>.dev</span>
      </Link>
    </nav>
  );
}
