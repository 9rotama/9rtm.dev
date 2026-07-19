import { formatDate } from "date-fns";
import { readFileSync } from "node:fs";
import path from "node:path";
import satori from "satori";
import sharp from "sharp";

type SiteOgpInput = {
  type: "site";
  isRandom: boolean;
};

type NoteOgpInput = {
  type: "note";
  title: string;
  emoji: string;
  publishedAt: Date;
  tags: string[];
  isRandom: boolean;
};

export type OgpInput = SiteOgpInput | NoteOgpInput;

const WIDTH = 1200;
const HEIGHT = 630;

function Avatar({
  size,
  rotation,
  src,
}: {
  size: number;
  rotation: number;
  src: string;
}) {
  return (
    <img
      src={src}
      width={size}
      height={size}
      style={{
        borderRadius: "100%",
        transform: `rotate(${rotation}deg)`,
      }}
    />
  );
}

function Logo({ fontSize }: { fontSize: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        fontFamily: "funnel-display",
        fontSize: `${fontSize}px`,
      }}
    >
      <span>9rtm</span>
      <span style={{ fontSize: `${fontSize * 0.8}px`, marginBottom: "3px" }}>
        .dev
      </span>
    </div>
  );
}

function SiteOgp({
  rotation,
  avatarSrc,
}: {
  rotation: number;
  avatarSrc: string;
}) {
  return (
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
      <Avatar size={360} rotation={rotation} src={avatarSrc} />
      <div style={{ display: "flex", marginTop: "18px" }}>
        <Logo fontSize={60} />
      </div>
    </div>
  );
}

function NoteOgp({
  input,
  rotation,
  avatarSrc,
}: {
  input: NoteOgpInput;
  rotation: number;
  avatarSrc: string;
}) {
  const tags = input.tags.slice(0, 3);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "64px 72px 52px",
        fontFamily: "m-plus-1",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: "72px", lineHeight: 1 }}>
          {input.emoji}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "28px",
            maxHeight: "176px",
            overflow: "hidden",
            lineClamp: 2,
            fontSize: "64px",
            fontWeight: 400,
            lineHeight: 1.35,
          }}
        >
          {input.title}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: "25px", color: "#9E98C7" }}>
            {formatDate(input.publishedAt, "MMM dd, yyyy")}
          </div>
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: "12px", marginTop: "18px" }}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    maxWidth: "180px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    border: "1px solid #5B557A",
                    borderRadius: "999px",
                    padding: "7px 16px",
                    color: "#BDB7E0",
                    fontSize: "20px",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Avatar size={72} rotation={rotation} src={avatarSrc} />
          <Logo fontSize={32} />
        </div>
      </div>
    </div>
  );
}

export async function generateOgpImage(input: OgpInput) {
  const funnelDisplayFont = readFileSync(
    path.resolve("src/ogp/fonts/funnel_display_sb.ttf"),
  );
  const mPlus1Font = readFileSync(
    path.resolve("src/ogp/fonts/m_plus_1_sb.ttf"),
  );
  const avatarSrc = `data:image/png;base64,${readFileSync(
    path.resolve("src/routes/_img/avatar.png"),
  ).toString("base64")}`;
  const rotation = input.isRandom ? Math.floor(Math.random() * 360) : 0;

  const svg = await satori(
    <div
      style={{
        display: "flex",
        backgroundColor: "#0F0D17",
        color: "#D3CEF2",
        width: "100%",
        height: "100%",
      }}
    >
      {input.type === "site" ? (
        <SiteOgp rotation={rotation} avatarSrc={avatarSrc} />
      ) : (
        <NoteOgp input={input} rotation={rotation} avatarSrc={avatarSrc} />
      )}
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
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
      loadAdditionalAsset: async (code, segment) => {
        if (code !== "emoji") return [];

        const codePoints = Array.from(segment)
          .map((character) => character.codePointAt(0)?.toString(16))
          .filter((codePoint) => codePoint && codePoint !== "fe0f")
          .join("-");
        const response = await fetch(
          `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoints}.svg`,
        );
        if (!response.ok) {
          throw new Error(`Failed to load emoji asset: ${segment}`);
        }
        const svg = Buffer.from(await response.text()).toString("base64");
        return `data:image/svg+xml;base64,${svg}`;
      },
    },
  );

  return sharp(Buffer.from(svg)).webp().toBuffer();
}
