import "@/app/globals.css";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import WidthContainer from "@/components/width-container";
import { siteUrl } from "@/constants/meta";
import clsx from "clsx";
import type { Metadata } from "next";
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
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
    <html lang="ja" className={geist.variable}>
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
