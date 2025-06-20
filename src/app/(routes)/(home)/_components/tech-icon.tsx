import { Tech, techs } from "../_lib/tech";

export default function TechIcon({ tech }: { tech: Tech }) {
  return (
    <div
      className="size-6 bg-light/35"
      style={{ maskImage: `url(${techs[tech].iconSrc})` }}
    />
  );
}
