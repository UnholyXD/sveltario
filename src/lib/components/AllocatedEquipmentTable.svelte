<script lang="ts">
  type Equipment = {
    tipo: string;
    id: string;
    marca: string;
    modelo: string;
    estado: string;
  };

  let { equipamentos }: { equipamentos: Equipment[] } = $props();

  const labels: Record<string, string> = {
    computador: 'Computador',
    monitor: 'Monitor',
    mouse: 'Mouse',
    teclado: 'Teclado',
    fone: 'Fone',
    outros: 'Outros'
  };
</script>

{#if equipamentos.length === 0}
  <p class="allocated-empty">Nenhum equipamento alocado para este colaborador.</p>
{:else}
  <div class="table-wrapper">
    <table>
      <caption class="visually-hidden">Equipamentos alocados para o colaborador</caption>
      <thead>
        <tr>
          <th scope="col">Tipo</th>
          <th scope="col">Identificação</th>
          <th scope="col">Marca</th>
          <th scope="col">Modelo</th>
          <th scope="col">Estado</th>
        </tr>
      </thead>
      <tbody>
        {#each equipamentos as equipamento}
          <tr>
            <td>{labels[equipamento.tipo] ?? equipamento.tipo}</td>
            <td>{equipamento.id}</td>
            <td>{equipamento.marca || '—'}</td>
            <td>{equipamento.modelo || '—'}</td>
            <td>{equipamento.estado || '—'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<button class="button--primary allocated-action" type="button">Alocar</button>
