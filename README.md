# 9rtm.dev

個人サイト・ブログ

## stack

| 項目                  | 名前                                          |
| --------------------- | --------------------------------------------- |
| フレームワーク        | [sveltekit](https://svelte.dev/docs/kit)      |
| markdown preprocessor | [mdsvex](https://mdsvex.pngwn.io/)            |
| 3D                    | [threlte](https://threlte.xyz/)               |
| ホスティング          | [cf workers](https://workers.cloudflare.com/) |

## environment variables

| Environment  | Secrets (platform.env) | Variables ($env/static) |
| ------------ | ---------------------- | ----------------------- |
| Production   | wrangler secret        | .env.production         |
| wrangler dev | .dev.vars              | .env.local              |
| vite dev     | -                      | .env.local              |
