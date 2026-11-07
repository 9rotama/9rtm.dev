// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

// Vite raw import for .sql files
declare module "*.sql?raw" {
  const content: string;
  export default content;
}

declare global {
  namespace Cloudflare {
    interface Env {
      _9rtm_dev_db: D1Database;
      DISCORD_WEBHOOK_URL: string;
      LIKE_RATE_LIMITER: RateLimit;
    }
  }

  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    interface Platform {
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
