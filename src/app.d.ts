// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

// Cloudflare D1 & Secrets (extends Env from worker-configuration.d.ts)
interface Env {
  DB: D1Database;
  DISCORD_WEBHOOK_URL: string;
}

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    interface Platform {
      env: Env;
      cf: CfProperties;
      ctx: ExecutionContext;
    }

    interface MdsvexFile {
      default: import("svelte").Component;
      metadata: Record<string, unknown>;
    }

    type MdsvexResolver = () => Promise<MdsvexFile>;
  }

  const __BUILD_TIME__: string;
}

export {};
