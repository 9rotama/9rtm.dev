<script lang="ts">
  import { Link as LinkIcon } from "@lucide/svelte";

  type Props = {
    href: string;
    title: string;
    description?: string;
    siteName: string;
    image?: string;
    icon?: string;
    external?: boolean;
  };

  const {
    href,
    title,
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
</script>

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
      class="bg-card-background-dark w-24 shrink-0 self-stretch object-cover sm:w-36"
    />
  {:else}
    <div
      class="bg-card-background-dark text-muted flex w-16 shrink-0 items-center justify-center self-stretch sm:w-20"
      aria-hidden="true"
    >
      <LinkIcon class="size-6" />
    </div>
  {/if}
  <span
    class="flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-2 sm:px-4 sm:py-3"
  >
    <span
      class="text-foreground line-clamp-2 text-sm/5 font-bold sm:text-base/6"
      >{title}</span
    >
    {#if description}
      <span class="text-muted line-clamp-2 text-xs/4 sm:text-sm/5"
        >{description}</span
      >
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
</a>
