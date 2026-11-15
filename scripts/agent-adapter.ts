import cloudflare from "@sveltejs/adapter-cloudflare";
import type { Adapter } from "@sveltejs/kit";
import { rename, writeFile } from "node:fs/promises";

export function agentAdapter(): Adapter {
  const adapter = cloudflare();
  return {
    ...adapter,
    async adapt(builder) {
      await adapter.adapt(builder);
      const pages: Record<string, string> = {};
      for (const path of builder.prerendered.assets.keys()) {
        if (!path.startsWith("/markdown/") || !path.endsWith(".md")) continue;
        const page = path.slice("/markdown".length, -".md".length);
        pages[page === "/index" ? "/" : page] = path;
      }

      // Prerendered assets bypass SvelteKit hooks, so negotiation wraps the adapter's Worker.
      await rename(
        ".svelte-kit/cloudflare/_worker.js",
        ".svelte-kit/cloudflare-tmp/site-worker.js",
      );
      await writeFile(
        ".svelte-kit/cloudflare/_worker.js",
        `
import app from '../cloudflare-tmp/site-worker.js';
import { handleAgentRequest } from '../../src/lib/agent-response.ts';
const pages = ${JSON.stringify(pages)};
export default {
  ...app,
  fetch(request, env, ctx) {
    return handleAgentRequest(request, (next) => app.fetch(next, env, ctx), env.ASSETS, pages);
  }
};
`,
      );
    },
  };
}
