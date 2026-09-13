<script lang="ts">
  import { ExternalLink, Link as LinkIcon } from "@lucide/svelte";

  type Props = {
    variant: "inline" | "card";
    href: string;
    title: string;
    label?: string;
    description?: string;
    siteName: string;
    image?: string;
    icon?: string;
    external?: boolean;
  };

  const {
    variant,
    href,
    title,
    label,
    description,
    siteName,
    image,
    icon,
    external = false,
  }: Props = $props();

  let iconFailed = $state(false);

  function hideBrokenIcon() {
    iconFailed = true;
  }

  function truncateInlineTitle(value: string): string {
    const characters = Array.from(value);
    return characters.length > 40
      ? characters.slice(0, 39).join("") + "…"
      : value;
  }
</script>

{#if variant === "card"}
  <a
    {href}
    target={external ? "_blank" : undefined}
    rel={external ? "noopener noreferrer" : undefined}
    class="border-border-solid from-card-background-dark to-card-background-vivid hover:from-card-background-vivid hover:to-card-background-dark my-6 flex min-h-28 overflow-hidden rounded-lg border bg-gradient-to-t text-inherit no-underline transition-colors"
  >
    {#if image}
      <img
        src={image}
        alt=""
        loading="lazy"
        class="bg-card-background-dark w-36 shrink-0 self-stretch object-cover"
      />
    {:else}
      <div
        class="bg-card-background-dark text-muted flex w-20 shrink-0 items-center justify-center self-stretch"
        aria-hidden="true"
      >
        <LinkIcon class="size-6" />
      </div>
    {/if}
    <span class="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3">
      <span class="text-foreground line-clamp-2 font-bold">{title}</span>
      {#if description}
        <span class="text-muted line-clamp-2 text-sm/5">{description}</span>
      {/if}
      <span class="text-muted flex items-center gap-1 text-xs">
        {#if icon && !iconFailed}
          <img
            src={icon}
            alt=""
            class="size-4 rounded-sm"
            onerror={hideBrokenIcon}
          />
        {:else}
          <LinkIcon class="size-3.5" aria-hidden="true" />
        {/if}
        <span class="truncate">{siteName}</span>
      </span>
    </span>
    {#if external}
      <ExternalLink
        class="text-muted my-3 mr-1 ml-3 size-4 shrink-0"
        aria-hidden="true"
      />
    {/if}
  </a>
{:else}
  <a
    {href}
    target={external ? "_blank" : undefined}
    rel={external ? "noopener noreferrer" : undefined}
    class="group inline max-w-full align-baseline text-inherit no-underline"
    title={label ? title : undefined}
  >
    {#if icon && !iconFailed}
      <img
        src={icon}
        alt=""
        class="relative -top-0.5 mr-1 ml-1 inline-block size-4 rounded-sm align-middle"
        onerror={hideBrokenIcon}
      />
    {:else}
      <LinkIcon
        class="text-muted relative -top-0.5 mr-0.5 inline-block size-3.5 align-middle"
        aria-hidden="true"
      />
    {/if}
    <span
      class="text-foreground decoration-accent font-bold underline underline-offset-4 transition-colors duration-100 group-hover:decoration-3"
      >{label || truncateInlineTitle(title)}</span
    >
    {#if external}
      <ExternalLink
        class="text-muted relative -top-0.5 inline-block size-3 align-middle"
        aria-hidden="true"
      />
    {/if}
  </a>
{/if}
