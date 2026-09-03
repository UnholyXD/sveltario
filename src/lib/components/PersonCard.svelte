<script lang="ts">
  let { nome, usuario, setor }: { nome: string; usuario: string; setor?: string | null } = $props();
</script>

<a class="person-card" href={`/pessoas/${encodeURIComponent(usuario)}`}>
  <span class="person-avatar" aria-hidden="true">
    <svg viewBox="0 0 96 96">
      <circle cx="48" cy="30" r="15" />
      <path d="M20 78c4-16 14-24 28-24s24 8 28 24" />
    </svg>
  </span>
  <span class="person-card__name">{nome}</span>
  <span class="person-card__user">{usuario}</span>
  {#if setor}
    <span class="person-card__department">{setor}</span>
  {/if}
</a>
