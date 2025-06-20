import "@/app/globals.css";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import WidthContainer from "@/components/width-container";
import { siteUrl } from "@/constants/meta";
import "@fontsource-variable/geist";
import clsx from "clsx";
import type { Metadata } from "next";

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
    <html lang="ja">
      <body className={clsx("overflow-x-hidden bg-bg text-fg-primary")}>
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
