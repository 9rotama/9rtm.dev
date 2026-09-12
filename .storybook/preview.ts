import type { Preview, Renderer } from "@storybook/sveltekit";
import { withThemeByClassName } from "@storybook/addon-themes";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/mona-sans";
import "../src/app.css";

const preview: Preview = {
  decorators: [
    withThemeByClassName<Renderer>({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
  ],
  parameters: {
    layout: "padded",
  },
};

export default preview;
