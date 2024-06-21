import { Tech, techs } from "@/constants/tech";
import styles from "./tech-icon.module.css";

export default function TechIcon({ tech }: { tech: Tech }) {
  return (
    <div
      className={styles.icon}
      style={{ maskImage: `url(${techs[tech].iconSrc})` }}
    />
  );
}
