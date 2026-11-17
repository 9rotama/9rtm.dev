import { building, dev } from "$app/env";
import type { Handle } from "@sveltejs/kit/hooks";
import { env } from "cloudflare:workers";
import { handleAgentRequest } from "#lib/agent-response.ts";

export const handle: Handle = ({ event, resolve }) => {
  // Dev and prerendering render pages themselves; only the built Worker serves them from assets.
  if (dev || building) return resolve(event);
  return handleAgentRequest(event.request, env.ASSETS, () => resolve(event));
};
