<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import PersonDetailsCard from '$lib/components/PersonDetailsCard.svelte';
  import AllocatedEquipmentTable from '$lib/components/AllocatedEquipmentTable.svelte';
  import EditPersonModal from '$lib/components/EditPersonModal.svelte';
  import AllocationModal from '$lib/components/AllocationModal.svelte';
  import DeallocateEquipmentModal from '$lib/components/DeallocateEquipmentModal.svelte';

  type Person = {
    nome: string;
    usuario: string;
    email?: string | null;
    telefone?: string | null;
    idEmpresa?: string | null;
    cracha?: string | null;
    setor?: string | null;
    acessoPortaExterna?: boolean;
    ativo?: boolean;
    observacoes?: string | null;
  };

  type Equipment = {
    tipo: string;
    id: string;
    marca: string;
    modelo: string;
    estado: string;
  };

  let { data } = $props<{ data: { usuario: string } }>();
  let pessoa = $state<Person | null>(null);
  let equipamentos = $state<Equipment[]>([]);
  let carregando = $state(true);
  let naoEncontrado = $state(false);
  let erro = $state(false);
  let editando = $state(false);
  let alocando = $state(false);
  let desalocando = $state<Equipment | null>(null);
  let autenticado = $state(false);

  async function carregarDetalhe() {
    try {
      const response = await fetch(`/api/pessoas/${encodeURIComponent(data.usuario)}`);
      if (response.status === 404) {
        naoEncontrado = true;
        return;
      }

      if (!response.ok) {
        throw new Error('Falha ao carregar colaborador.');
      }

      const result = await response.json();
      pessoa = result;
      equipamentos = Array.isArray(result.equipamentos) ? result.equipamentos : [];
      const sessionResponse = await fetch('/api/auth/session');
      autenticado = sessionResponse.ok && Boolean((await sessionResponse.json()).authenticated);
    } catch {
      erro = true;
    } finally {
      carregando = false;
    }
  }

  onMount(carregarDetalhe);
</script>

<svelte:head>
  <title>{pessoa ? `${pessoa.nome} | Pessoas` : 'Detalhe da pessoa'} | SVeltário</title>
</svelte:head>

<Navbar active="/pessoas" />

<main class="person-detail-page">
  {#if carregando}
    <section class="card panel detail-state" aria-live="polite"><p>Carregando colaborador...</p></section>
  {:else if naoEncontrado}
    <section class="card panel detail-state" role="alert"><p>Colaborador não encontrado.</p></section>
  {:else if erro || !pessoa}
    <section class="card panel detail-state" role="alert"><p>Não foi possível carregar os dados do colaborador.</p></section>
  {:else}
    <PersonDetailsCard {pessoa} {autenticado} onEdit={() => editando = true} />
    <section class="allocated-section card panel" aria-labelledby="allocated-title">
      <div class="allocated-heading">
        <h2 id="allocated-title">Equipamentos alocados</h2>
      </div>
      <AllocatedEquipmentTable {equipamentos} {autenticado} onAllocate={() => alocando = true} onDeallocate={(equipamento) => desalocando = equipamento} />
    </section>
  {/if}

  {#if alocando && pessoa && autenticado}
    <AllocationModal
      initialPerson={{ nome: pessoa.nome, usuario: pessoa.usuario }}
      onClose={() => alocando = false}
      onSaved={carregarDetalhe}
    />
  {/if}
</main>

{#if editando && pessoa && autenticado}
  <EditPersonModal
    {pessoa}
    onClose={() => editando = false}
    onSaved={(atualizada) => {
      pessoa = atualizada;
      editando = false;
    }}
  />
{/if}

{#if desalocando && pessoa && autenticado}
  <DeallocateEquipmentModal
    equipamento={desalocando}
    pessoa={{ nome: pessoa.nome, usuario: pessoa.usuario }}
    onClose={() => desalocando = null}
    onConfirmed={() => {
      equipamentos = equipamentos.filter((item) => !(item.tipo === desalocando?.tipo && item.id === desalocando?.id));
      desalocando = null;
    }}
  />
{/if}
