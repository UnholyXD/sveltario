<script lang="ts">
  export type EquipmentRow = {
    tipo: string;
    id: string;
    marca?: string;
    modelo?: string;
    estado?: string;
    alocadoPara?: { nome: string; usuario: string } | null;
  };

  let { equipamentos }: { equipamentos: EquipmentRow[] } = $props();

  const labels: Record<string, string> = {
    computador: 'Computador',
    monitor: 'Monitor',
    fone: 'Fone',
    mouse: 'Mouse',
    teclado: 'Teclado',
    outros: 'Outros'
  };

  const states: Record<string, string> = {
    novo: 'Novo',
    bom: 'Bom',
    marcas_de_uso: 'Marcas de uso',
    danificado: 'Danificado',
    manutencao: 'Manutenção',
    baixado: 'Baixado'
  };
</script>

<div class="table-wrapper equipment-table-wrapper">
  <table class="equipment-table">
    <thead>
      <tr>
        <th scope="col">Tipo</th>
        <th scope="col">Identificação</th>
        <th scope="col">Marca</th>
        <th scope="col">Modelo</th>
        <th scope="col">Alocado para</th>
        <th scope="col">Estado</th>
      </tr>
    </thead>
    <tbody>
      {#each equipamentos as equipamento}
        <tr>
          <td>{labels[equipamento.tipo] ?? equipamento.tipo}</td>
          <td>{equipamento.id || '—'}</td>
          <td>{equipamento.marca || '—'}</td>
          <td>{equipamento.modelo || '—'}</td>
          <td>{equipamento.alocadoPara ? `${equipamento.alocadoPara.nome} (${equipamento.alocadoPara.usuario})` : 'Disponível'}</td>
          <td>{states[equipamento.estado ?? ''] ?? equipamento.estado ?? '—'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
