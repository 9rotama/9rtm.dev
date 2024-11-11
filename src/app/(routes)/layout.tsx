import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/components/navbar";
import WidthContainer from "@/components/width-container";
import styles from "./layout.module.css";
import Footer from "@/components/footer";
import { siteUrl } from "@/constants/meta";
import { lineSeedJp } from "@/lib/fonts";
import clsx from "clsx";

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
      <body
        className={clsx(
          lineSeedJp.variable,
          "overflow-x-hidden bg-bg-primary text-text-body [scrollbar-gutter:stable]",
        )}
      >
        <div className="flex flex-col items-center">
          <WidthContainer>
            <header>
              <Navbar />
            </header>
            <div className="mt-12">{children}</div>
          </WidthContainer>
          <Footer />
        </div>
      </body>
    </html>
  );
}
