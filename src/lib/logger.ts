import pino from "pino";

export const logger = pino({
  level: import.meta.env.DEV ? "debug" : "info",
  ...(import.meta.env.DEV && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  }),
});
