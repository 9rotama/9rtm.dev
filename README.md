# 9rtm.dev

9rotama's personal website includes blog

## stack

| uses                  | name                                          |
| --------------------- | --------------------------------------------- |
| framework             | [sveltekit](https://svelte.dev/docs/kit)      |
| markdown preprocessor | [mdsvex](https://mdsvex.pngwn.io/)            |
| 3d                    | [threlte](https://threlte.xyz/)               |
| hosting               | [cf workers](https://workers.cloudflare.com/) |

## environment variables

| Environment  | Secrets (platform.env) | Variables ($env/static) |
| ------------ | ---------------------- | ----------------------- |
| Production   | wrangler secret        | .env.production         |
| wrangler dev | .dev.vars              | .env.local              |
| vite dev     | -                      | .env.local              |
