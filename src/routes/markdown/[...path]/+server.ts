import { error } from "@sveltejs/kit";
import { PUBLIC_BASE_URL } from "$app/env/public";
import { formatDate } from "date-fns";
import { getSelfNotes, getSelfNoteSource } from "#lib/content.ts";
import { profile } from "#lib/profile.ts";
import { repos } from "../../_lib/repos";
import type { EntryGenerator, RequestHandler } from "./$types";

function publishedNotes() {
  const result = getSelfNotes();
  if (!result.success) error(500, "Unable to load notes");
  return result.data.notes
    .filter((note) => note.published)
    .sort((a, b) => b.published_at.getTime() - a.published_at.getTime());
}

export const prerender = true;
export const entries: EntryGenerator = () => [
  { path: "index.md" },
  { path: "notes.md" },
  ...publishedNotes().map((note) => ({ path: `notes/${note.slug}.md` })),
];

const absolute = (path: string) => new URL(path, PUBLIC_BASE_URL).toString();
const noteLink = (note: ReturnType<typeof publishedNotes>[number]) =>
  `[${note.emoji} ${note.title}](${absolute(`/notes/${note.slug}`)})\n\n${formatDate(note.published_at, "MMM dd, yyyy")}\n\n${note.tags.join(" / ")}`;

export const GET: RequestHandler = ({ params }) => {
  let body: string;
  if (params.path === "index.md") {
    const latest = publishedNotes()[0];
    body = [
      `# ${profile.name}`,
      profile.description,
      `[GitHub](${profile.github}) / [Zenn](${profile.zenn})`,
      `can: ${profile.skills}`,
      `interest: ${profile.interests}`,
      `hobby: ${profile.hobbies}`,
      ...(latest
        ? [
            "## latest note",
            noteLink(latest),
            `[view all notes](${absolute("/notes")})`,
          ]
        : []),
      "## crafts",
      ...repos
        .filter((repo) => repo.display)
        .map((repo) =>
          [
            `### ${repo.name}`,
            repo.description,
            ...(repo.links ?? []).map(
              (link) => `[${link.label}](${link.href})`,
            ),
            ...(repo.githubLink ? [`[GitHub](${repo.githubLink.href})`] : []),
          ].join("\n\n"),
        ),
    ].join("\n\n");
  } else if (params.path === "notes.md") {
    body = ["# notes", "雑記・備忘録", ...publishedNotes().map(noteLink)].join(
      "\n\n",
    );
  } else {
    const match = /^notes\/([^/]+)\.md$/.exec(params.path);
    const note = match ? getSelfNoteSource(match[1]) : null;
    if (!note) error(404, "Note not found");
    body = note.raw;
  }
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
