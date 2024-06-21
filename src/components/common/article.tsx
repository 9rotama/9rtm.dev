import styles from "./article.module.css";

export default function Article({ children }: { children: React.ReactNode }) {
  return <article className={styles.article}>{children}</article>;
}
