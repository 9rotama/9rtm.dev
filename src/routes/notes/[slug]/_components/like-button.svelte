<script lang="ts">
  import { postLike } from "../_lib/like-api";
  import { getLikedNotes, setLiked } from "../_lib/liked-notes";

  interface Props {
    slug: string;
  }

  const { slug }: Props = $props();

  let isLiked = $state(getLikedNotes()[slug] ?? false);

  async function handleLike() {
    if (isLiked) return;

    // 楽観的更新：即座にUI反映
    isLiked = true;
    setLiked(slug, true);

    // APIリクエスト（失敗したらロールバック）
    const success = await postLike(slug);
    if (!success) {
      isLiked = false;
      setLiked(slug, false);
    }
  }
</script>

<button
  onclick={handleLike}
  disabled={isLiked}
  class="border-border bg-background hover:bg-muted cursor-pointer rounded-lg border px-4 py-2 transition-colors disabled:cursor-default disabled:opacity-50"
>
  {isLiked ? "Liked!" : "Like"}
</button>
