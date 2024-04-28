import styles from "./project-card.module.css";

type Props = {
  id: string;
  name: string;
  imageSrc: string;
};

export default function ProjectCard({ id, name, imageSrc }: Props) {
  return (
    <div
      className={styles.card}
      style={{ backgroundImage: `url(${imageSrc})` }}
    >
      <div className={styles.darker} />
      <div className={styles.name}>{name}</div>
    </div>
  );
}
