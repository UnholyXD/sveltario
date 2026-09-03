<script lang="ts">
  let { label, count, active = false, onSelect }: {
    label: string;
    count: number;
    active?: boolean;
    onSelect: () => void;
  } = $props();
</script>

<button
  class:equipment-type-card--active={active}
  class="equipment-type-card"
  type="button"
  aria-pressed={active}
  onclick={onSelect}
>
  <span class="equipment-type-card__icon" aria-hidden="true">
    {#if label === 'Computador'}
      <svg viewBox="0 0 48 48"><rect x="8" y="7" width="32" height="23" rx="2" /><path d="M18 39h12M24 30v9" /></svg>
    {:else if label === 'Monitor'}
      <svg viewBox="0 0 48 48"><rect x="7" y="8" width="34" height="24" rx="2" /><path d="M18 40h12M24 32v8" /></svg>
    {:else if label === 'Fone'}
      <svg viewBox="0 0 48 48"><path d="M10 27a14 14 0 0 1 28 0" /><path d="M10 27v9a4 4 0 0 0 4 4h3V26h-3a4 4 0 0 0-4 4M38 27v9a4 4 0 0 1-4 4h-3V26h3a4 4 0 0 1 4 4" /></svg>
    {:else if label === 'Mouse'}
      <svg viewBox="0 0 48 48"><rect x="14" y="6" width="20" height="36" rx="10" /><path d="M24 7v12M20 13h8" /></svg>
    {:else if label === 'Teclado'}
      <svg viewBox="0 0 48 48"><rect x="5" y="13" width="38" height="22" rx="3" /><path d="M11 20h2M17 20h2M23 20h2M29 20h2M35 20h2M11 26h2M17 26h2M23 26h2M29 26h8M14 31h20" /></svg>
    {:else}
      <svg viewBox="0 0 48 48"><path d="M10 15h28v24H10zM15 10h18v5M16 21h16M16 27h16M16 33h10" /></svg>
    {/if}
  </span>
  <span class="equipment-type-card__content">
    <strong>{label}</strong>
    <span>{count} {count === 1 ? 'item' : 'itens'}</span>
  </span>
  <span class="equipment-type-card__add" aria-hidden="true" title="Cadastro em breve">+</span>
</button>
