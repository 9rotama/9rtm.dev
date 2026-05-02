<script lang="ts">
  import { Rss } from "@lucide/svelte";
</script>

<footer class="flex flex-col items-center gap-2 text-sm">
  <p class="text-muted/70 text-center text-xs">&copy; 2026 9rotama</p>
  <p class="text-muted/70 text-center text-xs">
    last updated: {__BUILD_TIME__}
  </p>
  <a
    href="/rss.xml"
    class="text-muted hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
    aria-label="RSS feed"
  >
    <Rss class="size-3.5" />
    <span>rss</span>
  </a>
</footer>
