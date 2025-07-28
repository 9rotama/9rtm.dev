<footer class="flex flex-col items-center gap-2 text-sm">
  <div class="flex flex-row items-center gap-2">
    <a
      href="/"
      class="text-muted hover:text-foreground decoration-muted/50 underline underline-offset-4"
    >
      home
    </a>
    <a
      href="/notes"
      class="text-muted hover:text-foreground decoration-muted/50 underline underline-offset-4"
    >
      notes
    </a>
  </div>
  <p class="text-muted mt-2 text-center">© 2025 9rotama</p>
  <p class="text-muted text-center">
    last updated: {new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })}
  </p>
</footer>
