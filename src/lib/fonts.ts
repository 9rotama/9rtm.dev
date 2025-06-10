import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

export const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["400", "800"],
});

export const lineSeedJp = localFont({
  src: [
    {
      path: "../assets/fonts/line-seed/LINESeedJP_OTF_Eb.woff2",
      weight: "900",
    },
    {
      path: "../assets/fonts/line-seed/LINESeedJP_OTF_Bd.woff2",
      weight: "700",
    },
    {
      path: "../assets/fonts/line-seed/LINESeedJP_OTF_Rg.woff2",
      weight: "400",
    },
    {
      path: "../assets/fonts/line-seed/LINESeedJP_OTF_Th.woff2",
      weight: "200",
    },
  ],
  display: "swap",
  variable: "--font-line-seed-jp",
});
