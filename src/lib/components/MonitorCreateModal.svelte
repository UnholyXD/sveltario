<script lang="ts">
  import EquipmentModal from './EquipmentModal.svelte';
  let props = $props();
</script>
<EquipmentModal tipo="monitor" {...props} />
