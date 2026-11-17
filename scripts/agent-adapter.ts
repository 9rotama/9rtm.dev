import cloudflare from "@sveltejs/adapter-cloudflare";
import type { Adapter } from "@sveltejs/kit";
import { isNegotiablePath } from "../src/lib/agent-response.ts";

export function agentAdapter(): Adapter {
  const adapter = cloudflare();
  return {
    ...adapter,
    adapt(builder) {
      // The adapter's Worker serves prerendered paths before hooks run.
      // Hiding negotiable paths lets `handle` pick their representation; their files are still written.
      return adapter.adapt({
        ...builder,
        prerendered: {
          ...builder.prerendered,
          paths: builder.prerendered.paths.filter(
            (path) => !isNegotiablePath(path),
          ),
        },
      });
    },
  };
}
