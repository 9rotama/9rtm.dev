import { Sns } from "@/app/(routes)/page";
import { ExternalLinkIcon } from "@radix-ui/react-icons";

export default function SnsLink({ svgId, href, name, iconSrc }: Sns) {
  return (
    <a
      href={href}
      className="group/link border-border flex flex-row items-center gap-3 rounded-sm border-2 px-3 py-2"
      aria-label={name}
    >
      <svg className="fill-light/30 size-5 transition-colors group-hover/link:fill-white/100">
        <use href={`${iconSrc}#${svgId}`} />
      </svg>
      <div className="text-sm">{name}</div>
      <ExternalLinkIcon className="text-light/30" />
    </a>
  );
}
