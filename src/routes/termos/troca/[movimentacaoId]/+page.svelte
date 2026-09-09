<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const labels: Record<string, string> = {
    computador: 'Computador / Notebook',
    monitor: 'Monitor',
    mouse: 'Mouse',
    teclado: 'Teclado',
    fone: 'Fone de Ouvido / Headset',
    outros: 'Outros'
  };

  function value(input: unknown): string {
    return typeof input === 'string' && input.trim() ? input : '—';
  }

  function itemLabel(equipment: typeof data.anterior): string {
    const tipo = equipment.tipo;
    return tipo === 'outros'
      ? value(equipment.categoria)
      : labels[tipo] ?? value(tipo);
  }

  function identification(equipment: typeof data.anterior): string {
    const values = equipment.tipo === 'computador'
      ? [equipment.serviceTag, equipment.patrimonio]
      : equipment.tipo === 'monitor'
        ? [equipment.numeroSerie, equipment.patrimonio]
        : [equipment.numeroSerie, equipment.patrimonio, equipment.id];
    return values.filter((item) => typeof item === 'string' && item.trim()).join(' / ') || value(equipment.id);
  }

  function state(input: unknown): string {
    const states: Record<string, string> = {
      novo: 'Novo',
      bom: 'Bom',
      marcas_de_uso: 'Com marcas de uso',
      danificado: 'Danificado',
      manutencao: 'Em manutenção',
      baixado: 'Baixado'
    };
    return states[value(input)] ?? value(input);
  }
</script>

<svelte:head>
  <title>Termo de troca | SVeltário</title>
</svelte:head>

<div class="term-page">
  <div class="term-controls" aria-label="Controles do termo">
    <a class="button--secondary" href={`/pessoas/${encodeURIComponent(data.usuario)}`}>Voltar</a>
    <button class="button--primary" type="button" onclick={() => window.print()}>Imprimir / Salvar como PDF</button>
  </div>

  <article class="term-document">
    <header class="term-header">
      <h1>TERMO DE TROCA E SUBSTITUIÇÃO<br />DE EQUIPAMENTOS</h1>
    </header>

    <p class="term-introduction">
      Eu, <strong>{data.pessoa.nome}</strong>, portador(a) do CPF
      <span class="blank cpf-blank"></span>,
      {#if data.pessoa.cargo}ocupante do cargo de <strong>{data.pessoa.cargo}</strong>{/if}
      {#if data.pessoa.cargo && data.pessoa.setor}, no setor {/if}
      {#if data.pessoa.setor}<strong>{data.pessoa.setor}</strong>{/if},
      declaro que realizei a troca de equipamento com a empresa
      <strong>Dinabox Soluções em Automação LTDA - ME</strong>,
      inscrita no CNPJ <strong>27.246.021/0001-48</strong>.
    </p>

    <section class="term-section">
      <h2>1. Equipamento Devolvido</h2>
      <table class="term-equipment-table">
        <thead><tr><th>Item</th><th>Descrição / Modelo</th><th>Nº de Série / Patrimônio</th><th>Estado no Momento da Devolução</th></tr></thead>
        <tbody><tr>
          <td><strong>{itemLabel(data.anterior)}</strong></td>
          <td>{value([data.anterior.marca, data.anterior.modelo].filter(Boolean).join(' / '))}</td>
          <td>{identification(data.anterior)}</td>
          <td>{state(data.anterior.estado)}</td>
        </tr></tbody>
      </table>
      <div class="term-observations"><strong>Motivo da Troca / Defeito Informado pelo Usuário:</strong></div>
    </section>

    <section class="term-section">
      <h2>2. Equipamento Entregue</h2>
      <table class="term-equipment-table">
        <thead><tr><th>Item</th><th>Descrição / Modelo</th><th>Nº de Série / Patrimônio</th><th>Estado na Entrega</th></tr></thead>
        <tbody><tr>
          <td><strong>{itemLabel(data.novo)}</strong></td>
          <td>{value([data.novo.marca, data.novo.modelo].filter(Boolean).join(' / '))}</td>
          <td>{identification(data.novo)}</td>
          <td>{state(data.novo.estado)}</td>
        </tr></tbody>
      </table>
      <div class="term-observations"><strong>Observações do Novo Equipamento:</strong></div>
    </section>

    <section class="term-section term-responsibilities">
      <h2>3. Termos e Aceite</h2>
      <p>O colaborador confirma a devolução do equipamento antigo e o recebimento do novo equipamento identificado neste termo.</p>
      <p>Permanecem válidas e aplicáveis todas as cláusulas, compromissos e responsabilidades previstas no Termo de Responsabilidade e Entrega de Equipamentos originalmente assinado pelo colaborador.</p>
      <p class="term-date">__________________, {data.data}.</p>
      <div class="signature-grid">
        <div class="signature-block">
          <div class="signature-space"></div><div class="signature-line"></div>
          <strong>{data.pessoa.nome}</strong>
          <span>CPF: <span class="blank signature-cpf-blank"></span></span>
        </div>
        <div class="signature-block">
          <div class="signature-space"></div><div class="signature-line"></div>
          <strong>Dinabox Soluções em Automação LTDA - ME</strong>
          <span>CNPJ: 27.246.021/0001-48</span>
          <span>Visto / Aprovação da Equipe de TI</span>
        </div>
      </div>
    </section>
  </article>
</div>
