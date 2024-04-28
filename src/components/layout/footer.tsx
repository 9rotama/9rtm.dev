import styles from "./footer.module.css";
import KaomojiKun from "./kaomoji-kun";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <KaomojiKun />
      &copy; {new Date().getFullYear()} 9rotama
    </footer>
  );
}
