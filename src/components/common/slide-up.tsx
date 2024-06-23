import styles from "./slide-up.module.css";

export default function SlideUp({
  delay,
  children,
}: {
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.slideUp} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
