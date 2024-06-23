import { ExternalLinkIcon } from "@radix-ui/react-icons";
import styles from "./sns-link.module.css";
import { Sns } from "@/app/(routes)/about/page";

export default function SnsLink({ href, name, iconSrc }: Sns) {
  return (
    <a href={href} className={styles.link} aria-label={name}>
      <div className={styles.icon} style={{ maskImage: `url(${iconSrc})` }} />
      <div className={styles.name}>{name}</div>
      <ExternalLinkIcon className={styles.linkIcon} />
    </a>
  );
}
