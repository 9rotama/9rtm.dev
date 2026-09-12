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
    class="border-border-solid bg-card-background-vivid hover:bg-card-background-vivid-light group my-6 flex min-h-28 overflow-hidden rounded-lg border text-inherit no-underline transition-colors"
  >
    {#if image}
      <img
        src={image}
        alt=""
        loading="lazy"
        class="bg-card-background-dark h-28 w-36 shrink-0 object-cover"
      />
    {:else}
      <div
        class="bg-card-background-dark text-muted flex h-28 w-20 shrink-0 items-center justify-center"
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
        class="text-muted m-3 size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    {/if}
  </a>
{:else}
  <a
    {href}
    target={external ? "_blank" : undefined}
    rel={external ? "noopener noreferrer" : undefined}
    class="border-border-solid bg-card-background-vivid hover:bg-card-background-vivid-light inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-0.5 align-baseline text-inherit no-underline transition-colors"
    title={label ? title : undefined}
  >
    {#if icon && !iconFailed}
      <img
        src={icon}
        alt=""
        class="size-4 shrink-0 rounded-sm"
        onerror={hideBrokenIcon}
      />
    {:else}
      <LinkIcon class="text-muted size-3.5 shrink-0" aria-hidden="true" />
    {/if}
    <span class="truncate">{label || truncateInlineTitle(title)}</span>
    {#if external}
      <ExternalLink class="text-muted size-3 shrink-0" aria-hidden="true" />
    {/if}
  </a>
{/if}
