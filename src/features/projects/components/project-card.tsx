import styles from "./project-card.module.css";
import { Project } from "@/app/(routes)/page";
import { ExternalLinkIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import TechIcon from "./tech-icon";

type Props = {
  data: Project;
};

export default function ProjectCard({ data }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.grow}>
        <div className={styles.header}>
          <div className={styles.tag}>{data.tag}</div>
          <div className={styles.links}>
            {data.githubHref && (
              <a href={data.githubHref}>
                <GitHubLogoIcon className={styles.link} />
              </a>
            )}
            {data.links &&
              data.links.map((l) => (
                <a key={l.href} href={l.href}>
                  <ExternalLinkIcon className={styles.link} />
                </a>
              ))}
          </div>
        </div>
        <div className={styles.name}>{data.name}</div>
        <div className={styles.description}>{data.description}</div>
      </div>

      <div className={styles.shrink}>
        {data.techs.map((t) => (
          <TechIcon key={t} tech={t} />
        ))}
      </div>
    </div>
  );
}
