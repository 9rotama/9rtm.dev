import { Project } from "@/app/(routes)/page";
import Image from "next/image";
import styles from "./project-modal-content.module.css";
import Link from "next/link";
import { ExternalLinkIcon, GitHubLogoIcon } from "@radix-ui/react-icons";

export default function ProjectModalContent({
  id,
  name,
  previewSrc,
  links,
  githubHref,
  description,
  tags,
}: Project) {
  return (
    <article className={styles.content}>
      <div className={styles.preview}>
        <Image src={previewSrc} fill objectFit="cover" alt={name} />
      </div>

      {tags ? (
        <ul className={styles.tags}>
          {tags.map((tag) => (
            <li key={tag} className={styles.tag}>
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      <p>{description}</p>

      <div>
        {links?.map((link) => {
          return (
            <ProjectModalLink key={link.label} href={link.href}>
              {link.label}
            </ProjectModalLink>
          );
        })}
        {githubHref ? (
          <ProjectModalLink href={githubHref}>
            view source on github
            <GitHubLogoIcon />
          </ProjectModalLink>
        ) : null}
      </div>
    </article>
  );
}

function ProjectModalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={styles.link} target="_blank">
      {children}
      <ExternalLinkIcon />
    </Link>
  );
}
