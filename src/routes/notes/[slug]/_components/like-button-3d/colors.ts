const LIKE_BUTTON_COLORS_DARK = {
  background: "#0e0d17",
  ambientLight: "#ddf",
  pointLight: "#caf",
  starLiked: "#eee",
  starUnliked: "#bbb",
  starEmissive: "#769",
} as const;

const LIKE_BUTTON_COLORS_LIGHT = {
  background: "#f5f1ff",
  ambientLight: "#99a",
  pointLight: "#a8e",
  starLiked: "#eee",
  starUnliked: "#ddd",
  starEmissive: "#a7c",
} as const;

export function getLikeButtonColors(mode: "light" | "dark") {
  return mode === "dark" ? LIKE_BUTTON_COLORS_DARK : LIKE_BUTTON_COLORS_LIGHT;
}
