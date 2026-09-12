import type { Preview, Renderer } from "@storybook/sveltekit";
import { withThemeByClassName } from "@storybook/addon-themes";
import "@fontsource-variable/mona-sans";
import "@fontsource/iosevka/400.css";
import "@fontsource/iosevka/700.css";
import "@fontsource/m-plus-1/400.css";
import "@fontsource/m-plus-1/700.css";
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
