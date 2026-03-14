const EMOTI_KUN_COLORS_DARK = {
  background: "#0e0d17",
  sphere: "#ffbbff",
  pointLight: "#bc84f1",
  rectAreaLight: "#c494e2",
  text: "#a23bcb",
} as const;

const EMOTI_KUN_COLORS_LIGHT = {
  background: "#e8dff5",
  sphere: "#e8b8ff",
  pointLight: "#bc84f1",
  rectAreaLight: "#c494e2",
  text: "#a23bcb",
} as const;

export function getEmotiKunColors(mode: "light" | "dark") {
  return mode === "dark" ? EMOTI_KUN_COLORS_DARK : EMOTI_KUN_COLORS_LIGHT;
}
