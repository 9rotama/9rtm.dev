"use client";
import * as Dialog from "@radix-ui/react-dialog";
import styles from "./project-modal.module.css";
import { Cross2Icon } from "@radix-ui/react-icons";

type Props = {
  card: React.ReactNode;
  content: React.ReactNode;
  title: string;
};

export default function ProjectModal({ card, content, title }: Props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className={styles.card}>{card}</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <div className={styles.contentContainer}>
          <Dialog.Content className={styles.content}>
            <header className={styles.header}>
              <Dialog.Title className={styles.title}>{title}</Dialog.Title>
              <Dialog.Close asChild>
                <button className={styles.close} aria-label="close">
                  <Cross2Icon className={styles.cross} scale={2} />
                </button>
              </Dialog.Close>
            </header>

            {content}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
