import type { Meta, StoryObj } from "@storybook/sveltekit";
import LinkPreview from "./link-preview.svelte";

const meta = {
  title: "mdsvex/LinkPreview",
  component: LinkPreview,
  args: {
    href: "https://9rtm.dev/notes/like-button",
    title: "SvelteKit と Cloudflare D1 でいいねボタンを実装する",
    description:
      "個人サイトの技術記事に、軽量で扱いやすいいいね機能を追加したときの設計と実装を紹介します。",
    siteName: "9rtm.dev",
    image: "https://media.9rtm.dev/notes/like-button/bloom-f353a3289458.png",
    icon: "/favicon.svg",
    external: true,
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

export const LongContent: Story = {
  args: {
    title:
      "長いタイトルが複数行になったときにもカード全体の高さと余白が崩れないことを確認するためのリンクプレビュー",
    description:
      "説明文も長い場合を想定しています。表示できる行数を超えたテキストが省略され、サイト名が押し出されないことを確認します。",
    siteName: "A very long example website name",
  },
};

export const MobileLongContent: Story = {
  args: LongContent.args,
  parameters: {
    viewport: {
      options: {
        iphoneSe: {
          name: "iPhone SE",
          styles: {
            width: "375px",
            height: "667px",
          },
        },
      },
    },
  },
  globals: {
    viewport: {
      value: "iphoneSe",
      isRotated: false,
    },
  },
};
