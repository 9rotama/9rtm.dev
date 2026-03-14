<script lang="ts">
  import { page } from "$app/state";
  import { House, NotebookText } from "@lucide/svelte";

  const navItems = [
    { href: "/", label: "home", icon: House },
    { href: "/notes", label: "notes", icon: NotebookText },
  ];

  function isActive(href: string, pathname: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }
</script>

<nav
  class="fixed bottom-0 left-0 z-50 flex w-full items-center justify-center pb-[env(safe-area-inset-bottom)]"
>
  <div
    class="border-border/50 from-card-background-dark/50 to-card-background-vivid-light/50 shadow-background/50 mb-4 flex items-center gap-1 rounded-full border bg-gradient-to-b px-2 py-1.5 shadow-lg backdrop-blur-xl"
  >
    {#each navItems as item (item.href)}
      {@const active = isActive(item.href, page.url.pathname)}
      <a
        href={item.href}
        class="group relative flex items-center gap-1.5 rounded-full px-4 py-2 text-xs transition-colors duration-150
          {active ? 'text-foreground' : 'text-muted hover:text-foreground'}"
      >
        <div
          class="from-accent/30 absolute inset-0 rounded-full bg-radial-[ellipse_at_bottom] to-transparent to-70% transition-opacity duration-150
            {active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}"
        ></div>
        <div
          class="bg-accent/60 absolute inset-x-3 bottom-0 h-[1px] rounded-full transition-opacity duration-150
            {active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}"
        ></div>
        <item.icon class="relative z-10 size-4" />
        <span class="font-display relative z-10">{item.label}</span>
      </a>
    {/each}
  </div>
</nav>
