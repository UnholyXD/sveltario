<script lang="ts">
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

  let { pessoa, onEdit, onAllocate }: { pessoa: Person; onEdit: () => void; onAllocate: () => void } = $props();
</script>

<section class="person-details card panel" aria-labelledby="person-name">
  <div class="person-details__avatar" aria-hidden="true">
    <svg viewBox="0 0 96 96">
      <circle cx="48" cy="30" r="15" />
      <path d="M20 78c4-16 14-24 28-24s24 8 28 24" />
    </svg>
  </div>

  <div class="person-details__body">
    <div class="person-details__heading">
      <div>
        <h1 id="person-name">{pessoa.nome}</h1>
        <p class="person-details__username">ID Dinabox: {pessoa.usuario}</p>
      </div>
      <div class="person-details__actions">
      <button class="button--secondary" type="button" aria-label="Alocar equipamento" onclick={onAllocate}>Alocar</button>
      <button class="button--secondary" type="button" aria-label="Editar pessoa" onclick={onEdit}>
        <span aria-hidden="true">⚙</span>
        Editar
      </button>
      </div>
    </div>

    <dl class="person-details__fields">
      <div><dt>E-mail</dt><dd>{pessoa.email || 'Não informado'}</dd></div>
      <div><dt>Telefone</dt><dd>{pessoa.telefone || 'Não informado'}</dd></div>
      <div><dt>ID Empresa</dt><dd>{pessoa.idEmpresa || 'Não informado'}</dd></div>
      <div>
        <dt>Crachá</dt>
        <dd class="badge-detail">
          {pessoa.cracha || 'Não informado'}
          <button class="access-hint" type="button" aria-describedby="access-tooltip">i</button>
          <span id="access-tooltip" class="access-tooltip" role="tooltip">
            Acesso à porta externa: {pessoa.acessoPortaExterna ? 'Sim' : 'Não'}
          </span>
        </dd>
      </div>
      <div><dt>Setor</dt><dd>{pessoa.setor || 'Não informado'}</dd></div>
      <div><dt>Status</dt><dd>{pessoa.ativo === false ? 'Inativo' : 'Ativo'}</dd></div>
    </dl>

    {#if pessoa.observacoes}
      <p class="person-details__notes"><strong>Observações:</strong> {pessoa.observacoes}</p>
    {/if}
  </div>
</section>
