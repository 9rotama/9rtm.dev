import clsx from "clsx";
import styles from "./project-card.module.css";

type Props = {
  id: string;
  name: string;
  previewSrc: string;
};

export default function ProjectCard({ id, name, previewSrc }: Props) {
  return (
    <div
      className={clsx(styles.card)}
      style={{ backgroundImage: `url(${previewSrc})` }}
    >
      <div className={styles.darker} />
      <div className={styles.name}>{name}</div>
    </div>
  );
}
