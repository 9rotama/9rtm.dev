import styles from "./width-container.module.css";

type Props = {
  children: React.ReactNode;
};

export default function WidthContainer({ children }: Props) {
  return <div className={styles.container}>{children}</div>;
}
