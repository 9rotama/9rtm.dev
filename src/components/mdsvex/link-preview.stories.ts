import type { Meta, StoryObj } from "@storybook/sveltekit";
import LinkPreview from "./link-preview.svelte";

const meta = {
  title: "mdsvex/LinkPreview",
  component: LinkPreview,
  args: {
    variant: "card",
    href: "https://9rtm.dev/notes/like-button",
    title: "SvelteKit と Cloudflare D1 でいいねボタンを実装する",
    description:
      "個人サイトの技術記事に、軽量で扱いやすいいいね機能を追加したときの設計と実装を紹介します。",
    siteName: "9rtm.dev",
    image: "/post-media/bloom.png",
    icon: "/favicon.svg",
    external: true,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["card", "inline"],
    },
  },
} satisfies Meta<typeof LinkPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Card: Story = {};

export const CardWithoutImage: Story = {
  args: {
    href: "/notes/internal-link",
    title: "画像や概要文が取得できなかったページ",
    description: undefined,
    image: undefined,
    icon: undefined,
    external: false,
  },
};

export const Inline: Story = {
  args: {
    variant: "inline",
    label: "Storybook 公式サイト",
  },
};

export const LongContent: Story = {
  args: {
    title:
      "長いタイトルが複数行になったときにもカード全体の高さと余白が崩れないことを確認するためのリンクプレビュー",
    description:
      "説明文も長い場合を想定しています。表示できる行数を超えたテキストが省略され、サイト名と外部リンクアイコンが押し出されないことを確認します。",
    siteName: "A very long example website name",
  },
};
