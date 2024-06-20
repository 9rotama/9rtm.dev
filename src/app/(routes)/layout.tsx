import type { Metadata } from "next";
import localFont from "next/font/local";
import "modern-css-reset";
import "@/app/globals.css";
import Navbar from "@/components/layout/navbar";
import WidthContainer from "@/components/layout/width-container";
import styles from "./layout.module.css";
import Footer from "@/components/layout/footer";
import { siteUrl } from "@/constants/meta";

const inter = localFont({
  src: "../InterVariable.woff2",
});

export const metadata: Metadata = {
  title: "9rtm.dev",
  description: "9rotama profile site",
  metadataBase: siteUrl,
  alternates: {
    canonical: "/",
  },
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
          <Footer />
        </div>
      </body>
    </html>
  );
}
