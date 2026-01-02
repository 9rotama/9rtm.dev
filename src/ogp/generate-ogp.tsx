import { readFileSync } from "node:fs";
import path from "node:path";
import satori from "satori";
import sharp from "sharp";

export async function generateOgpImage({ isRandom }: { isRandom: boolean }) {
  const funnelDisplayFont = readFileSync(
    path.resolve("src/ogp/fonts/funnel_display_sb.ttf"),
  );
  const mPlus1Font = readFileSync(
    path.resolve("src/ogp/fonts/m_plus_1_sb.ttf"),
  );
  const rotation = isRandom ? Math.floor(Math.random() * 360) : 0;

  const svg = await satori(
    <div
      style={{
        display: "flex",
        backgroundColor: "#0F0D17",
        color: "#D3CEF2",
        width: "100%",
        height: "100%",
        padding: "32px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <img
          src="http://9rtm.dev/avatar.png"
          style={{
            width: "480px",
            height: "480px",
            borderRadius: "100%",
            marginBottom: "24px",
            transform: `rotate(${rotation}deg)`,
          }}
        />
        <div
          style={{
            fontSize: "80px",
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <span>9rtm</span>
          <span style={{ fontSize: "64px", marginBottom: "4px" }}>.dev</span>
        </div>
      </div>
    </div>,
    {
      width: 1600,
      height: 800,
      fonts: [
        {
          name: "funnel-display",
          data: funnelDisplayFont,
          weight: 400,
          style: "normal",
        },
        {
          name: "m-plus-1",
          data: mPlus1Font,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );

  const webp = await sharp(Buffer.from(svg)).webp().toBuffer();

  return webp;
}
