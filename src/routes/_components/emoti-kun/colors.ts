const EMOTI_KUN_COLORS_DARK = {
  background: "#0b0a13",
  sphere: "#ffbbff",
  pointLight: "#bc84f1",
  rectAreaLight: "#c494e2",
  text: "#a23bcb",
  floorGrid: "#b89ad8",
  floorBg: "#0b0a13",
  attenuationColor: "#0b0a13",
  attenuationDistance: 2,
} as const;

const EMOTI_KUN_COLORS_LIGHT = {
  background: "#f5f1ff",
  sphere: "#e8b8ff",
  pointLight: "#bc84f1",
  rectAreaLight: "#c494e2",
  text: "#a23bcb",
  floorGrid: "#c8aae8",
  floorBg: "#f5f1ff",
  attenuationColor: "#ffffff",
  attenuationDistance: 5,
} as const;

export function getEmotiKunColors(mode: "light" | "dark") {
  return mode === "dark" ? EMOTI_KUN_COLORS_DARK : EMOTI_KUN_COLORS_LIGHT;
}
