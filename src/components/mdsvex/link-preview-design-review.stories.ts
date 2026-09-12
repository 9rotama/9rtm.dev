import type { Meta, StoryObj } from "@storybook/sveltekit";
import LinkPreviewDesignReview from "./link-preview-design-review.svelte";

const meta = {
  title: "mdsvex/LinkPreview/Design review",
  component: LinkPreviewDesignReview,
  parameters: {
    controls: { disable: true },
  },
} satisfies Meta<typeof LinkPreviewDesignReview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {};
