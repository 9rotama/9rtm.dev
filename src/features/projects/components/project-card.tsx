import { Project } from "@/app/(routes)/page";
import { ExternalLinkIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import TechIcon from "./tech-icon";

type Props = {
  data: Project;
};

export default function ProjectCard({ data }: Props) {
  return (
    <div className="flex size-full flex-col rounded-md bg-bg-card/[6%] px-4 py-3 pb-4">
      <div className="flex grow flex-col items-start gap-2">
        <div className="flex w-full flex-row content-between">
          <div className="w-full text-sm font-bold tracking-wider opacity-40">
            {data.tag}
          </div>
          <div className="flex flex-row gap-2">
            {data.githubHref && (
              <a href={data.githubHref}>
                <GitHubLogoIcon className="size-5" />
              </a>
            )}
            {data.links &&
              data.links.map((l) => (
                <a key={l.href} href={l.href}>
                  <ExternalLinkIcon className="size-5" />
                </a>
              ))}
          </div>
        </div>
        <div className="font-bold tracking-wider">{data.name}</div>
        <div className="text-sm">{data.description}</div>
      </div>

      <div className="flex shrink-0 flex-row gap-2 pt-4">
        {data.techs.map((t) => (
          <TechIcon key={t} tech={t} />
        ))}
      </div>
    </div>
  );
}
