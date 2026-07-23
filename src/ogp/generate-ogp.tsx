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
const SURFACE_MARGIN = 24;
const FLUENT_EMOJI_3D_PATHS: Record<string, string> = {
  "1f4d2": "Ledger/3D/ledger_3d.png",
  "1f9f1": "Brick/3D/brick_3d.png",
  "2728": "Sparkles/3D/sparkles_3d.png",
};

function OgpSurface({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: `${WIDTH - SURFACE_MARGIN * 2}px`,
        height: `${HEIGHT - SURFACE_MARGIN * 2}px`,
        overflow: "hidden",
        border: "1px solid #4A4561",
        borderRadius: "28px",
        backgroundImage: "linear-gradient(180deg, #120F1E 0%, #07060F 100%)",
        boxShadow: "0 18px 42px rgba(3, 2, 8, 0.52)",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: "28px",
          right: "28px",
          height: "1px",
          backgroundImage:
            "linear-gradient(90deg, transparent, rgba(227, 221, 255, 0.3), transparent)",
        }}
      />
      {children}
    </div>
  );
}

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
        border: "1px solid rgba(211, 206, 242, 0.28)",
        boxShadow: "0 10px 24px rgba(3, 2, 8, 0.38)",
        boxSizing: "border-box",
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
        fontFamily: "michroma",
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
        padding: "40px 48px 28px",
        fontFamily: "mona-sans, m-plus-1",
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
            fontSize: "60px",
            fontWeight: 700,
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
                    backgroundImage:
                      "linear-gradient(180deg, rgba(11, 9, 18, 0.82), rgba(55, 37, 79, 0.52))",
                    boxShadow:
                      "0 3px 8px rgba(3, 2, 8, 0.24), inset 0 1px rgba(227, 221, 255, 0.08)",
                    padding: "7px 16px",
                    color: "#BDB7E0",
                    fontFamily: "michroma",
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
  const mPlus1Font = readFileSync(
    path.resolve(
      "node_modules/@fontsource/m-plus-1/files/m-plus-1-japanese-700-normal.woff",
    ),
  );
  const monaSansFont = readFileSync(
    path.resolve("src/ogp/fonts/mona_sans_regular.otf"),
  );
  const michromaFont = readFileSync(path.resolve("static/fonts/michroma.ttf"));
  const avatarSrc = `data:image/png;base64,${readFileSync(
    path.resolve("src/routes/_img/avatar.png"),
  ).toString("base64")}`;
  const rotation = input.isRandom ? Math.floor(Math.random() * 360) : 0;

  const svg = await satori(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0B0912",
        color: "#D3CEF2",
        width: "100%",
        height: "100%",
      }}
    >
      <OgpSurface>
        {input.type === "site" ? (
          <SiteOgp rotation={rotation} avatarSrc={avatarSrc} />
        ) : (
          <NoteOgp input={input} rotation={rotation} avatarSrc={avatarSrc} />
        )}
      </OgpSurface>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: "michroma",
          data: michromaFont,
          weight: 400,
          style: "normal",
        },
        {
          name: "mona-sans",
          data: monaSansFont,
          weight: 400,
          style: "normal",
        },
        {
          name: "m-plus-1",
          data: mPlus1Font,
          weight: 700,
          style: "normal",
        },
      ],
      loadAdditionalAsset: async (code, segment) => {
        if (code !== "emoji") return [];

        const codePoints = Array.from(segment)
          .map((character) => character.codePointAt(0)?.toString(16))
          .filter((codePoint) => codePoint && codePoint !== "fe0f")
          .join("-");
        const assetPath = FLUENT_EMOJI_3D_PATHS[codePoints];
        if (!assetPath) {
          throw new Error(`Unsupported Fluent Emoji asset: ${segment}`);
        }
        const response = await fetch(
          `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/${assetPath}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to load emoji asset: ${segment}`);
        }
        const png = Buffer.from(await response.arrayBuffer()).toString(
          "base64",
        );
        return `data:image/png;base64,${png}`;
      },
    },
  );

  return sharp(Buffer.from(svg)).webp().toBuffer();
}
