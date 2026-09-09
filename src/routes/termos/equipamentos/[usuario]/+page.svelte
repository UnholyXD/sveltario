<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Termo de equipamentos | SVeltário</title>
</svelte:head>

<div class="term-page">
  <div class="term-controls" aria-label="Controles do termo">
    <a
      class="button--secondary"
      href={`/pessoas/${encodeURIComponent(data.usuario)}`}
    >
      Voltar
    </a>

    <button
      class="button--primary"
      type="button"
      onclick={() => window.print()}
    >
      Imprimir / Salvar como PDF
    </button>
  </div>

  <article class="term-document">
    <header class="term-header">
      <h1>
        TERMO DE RESPONSABILIDADE E ENTREGA<br />
        DE EQUIPAMENTOS
      </h1>
    </header>

    <p class="term-introduction">
      Eu, <strong>{data.pessoa.nome}</strong>, portador(a) do CPF
      <span class="blank cpf-blank"></span>,
      {#if data.pessoa.cargo || data.pessoa.setor}
        {#if data.pessoa.cargo}
          ocupante do cargo de <strong>{data.pessoa.cargo}</strong>
        {/if}
        {#if data.pessoa.cargo && data.pessoa.setor}
          , no setor <strong>{data.pessoa.setor}</strong>
        {:else if data.pessoa.setor}
          lotado(a) no setor <strong>{data.pessoa.setor}</strong>
        {/if},
      {/if}
      declaro que recebi da empresa
      <strong>Dinabox Soluções em Automação LTDA - ME</strong>,
      inscrita no CNPJ <strong>27.246.021/0001-48</strong>,
      os equipamentos e acessórios discriminados abaixo, em perfeitas
      condições de funcionamento e conservação (salvo observações registradas
      neste termo), para uso exclusivo na execução das minhas atividades
      profissionais.
    </p>

    <section class="term-section">
      <h2>1. Relação de Equipamentos Entregues</h2>

      {#if data.equipamentos.length}
        <table class="term-equipment-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Descrição / Modelo</th>
              <th>Nº de Série / Patrimônio</th>
              <th>Estado de Conservação</th>
            </tr>
          </thead>

          <tbody>
            {#each data.equipamentos as equipamento}
              <tr>
                <td>
                  <strong>{equipamento.item}</strong>
                </td>

                <td>{equipamento.descricao}</td>

                <td>{equipamento.identificacao}</td>

                <td>
                  {#if ['fone', 'teclado', 'mouse'].includes(equipamento.tipo)}
                    <span class="manual-condition">
                      ( ) Novo    ( ) Bom<br />
                      ( ) Com marcas de uso*
                    </span>
                  {:else}
                    {equipamento.estado}
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p class="term-empty">
          Nenhum equipamento está atualmente alocado a este colaborador.
        </p>
      {/if}

      <div class="term-observations">
        <strong>Observações sobre os equipamentos:</strong>
      </div>
    </section>

    <section class="term-section term-responsibilities">
      <h2>2. Compromissos e Responsabilidades do Colaborador</h2>

      <p>
        Ao assinar este termo, o colaborador declara estar ciente e de acordo
        com as seguintes condições:
      </p>

      <ul>
        <li>
          <strong>Guarda e Conservação:</strong>
          Comprometo-me a zelar pela integridade física e pelo bom funcionamento
          de todos os itens sob minha responsabilidade.
        </li>

        <li>
          <strong>Uso Exclusivo:</strong>
          Os equipamentos destinam-se
          <strong>estritamente ao uso profissional</strong>,
          sendo vedado o uso por terceiros não autorizados ou para fins pessoais.
        </li>

        <li>
          <strong>Comunicação de Defeitos:</strong>
          Qualquer falha, mal funcionamento ou avaria mecânica/física deve ser
          comunicada <strong>imediatamente</strong> à equipe de TI.
        </li>

        <li>
          <strong>Perda, Roubo ou Danos por Mau Uso:</strong>
          Em caso de perda, roubo, furto ou danos comprovadamente decorrentes
          de negligência, mau uso ou dolo, o colaborador poderá ser
          responsabilizado nos termos da legislação vigente
          (Art. 462, § 1º da CLT).
        </li>

        <li>
          <strong>Devolução:</strong>
          Em caso de desligamento, alteração de modalidade de trabalho ou
          solicitação da empresa, comprometo-me a devolver todos os itens
          listados nas mesmas condições em que os recebi, ressalvado o desgaste
          natural pelo uso regular.
        </li>
      </ul>
    </section>

    <section class="term-section term-signatures">
      <h2>3. Aceite e Assinaturas</h2>

      <p>
        Declarando ter conferido todos os itens listados acima, firmo o presente
        termo.
      </p>

      <p class="term-date">
        ____________________, {data.data}.
      </p>

      <div class="signature-grid">
        <div class="signature-block">
          <div class="signature-space"></div>
          <div class="signature-line"></div>

          <strong>{data.pessoa.nome}</strong>

          <span>
            CPF:
            <span class="blank signature-cpf-blank"></span>
          </span>
        </div>

        <div class="signature-block">
          <div class="signature-space"></div>
          <div class="signature-line"></div>

          <strong>
            Dinabox Soluções em Automação LTDA - ME
          </strong>

          <span>CNPJ: 27.246.021/0001-48</span>
          <span>Visto / Aprovação da Equipe de TI</span>
        </div>
      </div>
    </section>
  </article>
</div>
