import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "modern-css-reset";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import WidthContainer from "@/components/layout/width-container";
import styles from "./layout.module.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "9rtm.dev",
  description: "9rotama profile site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className={styles.center}>
          <WidthContainer>
            <header>
              <Navbar />
            </header>
            <div className={styles.main}>{children}</div>
          </WidthContainer>
        </div>
      </body>
    </html>
  );
}
