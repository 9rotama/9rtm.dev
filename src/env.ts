import { defineEnvVars } from "@sveltejs/kit/env";
import { z } from "zod";

export const variables = defineEnvVars({
  PUBLIC_BASE_URL: {
    schema: z.url(),
    public: true,
    static: true,
  },
});
