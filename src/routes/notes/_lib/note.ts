export type Note = {
  href: string;
  title: string;
  thumbnail: { type: "image"; href: string } | { type: "emoji"; emoji: string };
  publishedAt: Date;
  platform: "zenn" | "self";
};
