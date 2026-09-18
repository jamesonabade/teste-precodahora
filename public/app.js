// Estado da Aplicação Frontend
let appData = {
  estabelecimentos: [],
  produtos: [],
  precosMap: {},
  precoSelecionadoId: null
};

let crudProdutosList = [];
let crudMercadosList = [];

// Elementos DOM Principais
const navTabs = document.querySelectorAll('.nav-tab');
const tabPanes = document.querySelectorAll('.tab-pane');
const btnRecarregar = document.getElementById('btnRecarregar');

// KPIs
const kpiMercados = document.getElementById('kpiMercados');
const kpiProdutos = document.getElementById('kpiProdutos');
const kpiPrecosHoje = document.getElementById('kpiPrecosHoje');
const kpiPendentesHoje = document.getElementById('kpiPendentesHoje');
const kpiConferidos = document.getElementById('kpiConferidos');
const kpiAlertas = document.getElementById('kpiAlertas');

// Controles Clean & Modos de Visualização
let modoVisualizacao = window.innerWidth <= 768 ? 'cards' : 'matriz';
const btnModoMatriz = document.getElementById('btnModoMatriz');
const btnModoCards = document.getElementById('btnModoCards');
const containerModoMatriz = document.getElementById('containerModoMatriz');
const containerModoCards = document.getElementById('containerModoCards');
const focusedHeaderMercado = document.getElementById('focusedHeaderMercado');
const cardsGridProdutos = document.getElementById('cardsGridProdutos');
const btnToggleFiltrosAvancados = document.getElementById('btnToggleFiltrosAvancados');
const painelFiltrosAvancados = document.getElementById('painelFiltrosAvancados');
const btnToggleLegenda = document.getElementById('btnToggleLegenda');
const painelLegenda = document.getElementById('painelLegenda');

// Tabela Matriz DIEESE
const tbodyMatriz = document.getElementById('tbodyMatriz');
const theadRow1 = document.getElementById('theadRow1');
const filtroSemana = document.getElementById('filtroSemana') || { value: '' };
const filtroMercado = document.getElementById('filtroMercado');
const filtroDiaSemana = document.getElementById('filtroDiaSemana');
const filtroDataColeta = document.getElementById('filtroDataColeta');
const filtroCategoria = document.getElementById('filtroCategoria');
const filtroStatusConferencia = document.getElementById('filtroStatusConferencia');
const buscaTexto = document.getElementById('buscaTexto');
const btnLimparFiltros = document.getElementById('btnLimparFiltros');

// Modal Crítica & Auditoria
const modalCritica = document.getElementById('modalCritica');
const btnFecharModal = document.getElementById('btnFecharModal');
const btnAprovarPreco = document.getElementById('btnAprovarPreco');
const btnDescartarPreco = document.getElementById('btnDescartarPreco');
const formAjusteCritica = document.getElementById('formAjusteCritica');

// Modal CRUD Produto
const modalCrudProduto = document.getElementById('modalCrudProduto');
const btnNovoProduto = document.getElementById('btnNovoProduto');
const btnFecharModalProduto = document.getElementById('btnFecharModalProduto');
const btnCancelarProduto = document.getElementById('btnCancelarProduto');
const formCrudProduto = document.getElementById('formCrudProduto');
const tbodyCrudProdutos = document.getElementById('tbodyCrudProdutos');
const buscaCrudProduto = document.getElementById('buscaCrudProduto');
const filtroCrudCategoria = document.getElementById('filtroCrudCategoria');

// Modal CRUD Mercado
const modalCrudMercado = document.getElementById('modalCrudMercado');
const btnNovoMercado = document.getElementById('btnNovoMercado');
const btnFecharModalMercado = document.getElementById('btnFecharModalMercado');
const btnCancelarMercado = document.getElementById('btnCancelarMercado');
const formCrudMercado = document.getElementById('formCrudMercado');
const tbodyCrudMercados = document.getElementById('tbodyCrudMercados');
const buscaCrudMercado = document.getElementById('buscaCrudMercado');
const filtroCrudSemana = document.getElementById('filtroCrudSemana');

// Modal Automação SEFAZ
const modalColeta = document.getElementById('modalColeta');
const btnAbrirColeta = document.getElementById('btnAbrirColeta');
const btnFecharModalColeta = document.getElementById('btnFecharModalColeta');
const btnDispararColeta = document.getElementById('btnDispararColeta');
const coletaSemana = document.getElementById('coletaSemana');
const coletaLimite = document.getElementById('coletaLimite');
const coletaDelayMin = document.getElementById('coletaDelayMin');
const coletaDelayMax = document.getElementById('coletaDelayMax');
const statusText = document.getElementById('statusText');
const percentText = document.getElementById('percentText');
const progressBar = document.getElementById('progressBar');
const itemAtualText = document.getElementById('itemAtualText');
const terminalLogs = document.getElementById('terminalLogs');

let pollingInterval = null;

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', async () => {
  setupTabs();
  setupEventListeners();
  await carregarStatus();
  await popularFiltroMercados();
  await carregarMatriz();
});

// Configuração de Abas
function setupTabs() {
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;
      navTabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');

      if (targetId === 'tab-calendario') carregarCalendario();
      if (targetId === 'tab-resumos') carregarResumosMedias();
      if (targetId === 'tab-configuracao') carregarConfiguracao();
      if (targetId === 'tab-produtos') carregarCrudProdutos();
      if (targetId === 'tab-mercados') carregarCrudMercados();
      if (targetId === 'tab-matriz') carregarMatriz();
      if (targetId === 'tab-logs') carregarHistoricoExecucoes();
    });
  });
}

function setupEventListeners() {
  btnRecarregar.addEventListener('click', () => {
    carregarStatus();
    const activeTab = document.querySelector('.nav-tab.active').dataset.tab;
    if (activeTab === 'tab-matriz') carregarMatriz();
    if (activeTab === 'tab-produtos') carregarCrudProdutos();
    if (activeTab === 'tab-mercados') carregarCrudMercados();
    if (activeTab === 'tab-logs') carregarHistoricoExecucoes();
  });

  // Alternador de Visualização (Matriz vs Cards)
  if (btnModoMatriz) {
    btnModoMatriz.addEventListener('click', () => setModoVisualizacao('matriz'));
  }
  if (btnModoCards) {
    btnModoCards.addEventListener('click', () => setModoVisualizacao('cards'));
  }

  // Toggle Filtros Avançados
  if (btnToggleFiltrosAvancados && painelFiltrosAvancados) {
    btnToggleFiltrosAvancados.addEventListener('click', () => {
      painelFiltrosAvancados.classList.toggle('hidden');
    });
  }

  // Toggle Legenda
  if (btnToggleLegenda && painelLegenda) {
    btnToggleLegenda.addEventListener('click', () => {
      painelLegenda.classList.toggle('hidden');
    });
  }

  // Pills Rápidas de Semana
  document.querySelectorAll('.semana-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.semana-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      if (filtroSemana) filtroSemana.value = pill.dataset.semana || '';
      carregarMatriz();
    });
  });

  // Filtros da Matriz
  if (filtroSemana && filtroSemana.addEventListener) filtroSemana.addEventListener('change', () => carregarMatriz());
  filtroMercado.addEventListener('change', () => {
    if (modoVisualizacao === 'cards') renderizarCardsFocados();
    else carregarMatriz();
  });
  filtroDiaSemana.addEventListener('change', () => carregarMatriz());
  filtroDataColeta.addEventListener('change', () => carregarMatriz());
  filtroCategoria.addEventListener('change', () => {
    if (modoVisualizacao === 'cards') renderizarCardsFocados();
    else renderizarTabela();
  });
  filtroStatusConferencia.addEventListener('change', () => {
    if (modoVisualizacao === 'cards') renderizarCardsFocados();
    else renderizarTabela();
  });
  buscaTexto.addEventListener('input', () => {
    if (modoVisualizacao === 'cards') renderizarCardsFocados();
    else renderizarTabela();
  });

  const checkApenasHoje = document.getElementById('checkApenasHoje');
  if (checkApenasHoje) checkApenasHoje.addEventListener('change', () => {
    if (modoVisualizacao === 'cards') renderizarCardsFocados();
    else renderizarTabela();
  });

  if (btnLimparFiltros) btnLimparFiltros.addEventListener('click', limparTodosFiltros);

  // Ações da Aba de Logs
  const btnRecarregarLogs = document.getElementById('btnRecarregarLogs');
  if (btnRecarregarLogs) btnRecarregarLogs.addEventListener('click', carregarHistoricoExecucoes);

  const btnDispararColetaAbaLogs = document.getElementById('btnDispararColetaAbaLogs');
  if (btnDispararColetaAbaLogs) btnDispararColetaAbaLogs.addEventListener('click', () => {
    abrirModal(modalColeta);
    verificarProgressoColeta();
  });

  const btnReTentarPendentes = document.getElementById('btnReTentarPendentes');
  if (btnReTentarPendentes) {
    btnReTentarPendentes.addEventListener('click', async () => {
      if (!confirm('Deseja iniciar a re-tentativa imediata para todos os produtos que ainda NÃO registraram venda hoje (entre 05:00 e 21:00)?')) return;
      try {
        mostrarToast('🔄 Disparando re-tentativa de itens pendentes de hoje...');
        const res = await fetch('/api/coleta/iniciar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apenasPendentes: true, rodada: 'Re-tentativa Pendentes' })
        });
        const data = await res.json();
        if (data.success) {
          mostrarToast(data.message || 'Re-tentativa em andamento!');
          abrirModal(modalColeta);
          verificarProgressoColeta();
        } else {
          mostrarToast(data.message || 'Erro ao iniciar', 'error');
        }
      } catch (err) {
        mostrarToast('Erro ao iniciar: ' + err.message, 'error');
      }
    });
  }

  const btnTestarNtfy = document.getElementById('btnTestarNtfy');
  if (btnTestarNtfy) btnTestarNtfy.addEventListener('click', testarNotificacaoNtfy);

  // Modal Crítica
  btnFecharModal.addEventListener('click', () => fecharModal(modalCritica));
  modalCritica.addEventListener('click', e => { if (e.target === modalCritica) fecharModal(modalCritica); });
  btnAprovarPreco.addEventListener('click', aprovarPrecoAtual);
  if (btnDescartarPreco) btnDescartarPreco.addEventListener('click', descartarPrecoIncoerente);
  formAjusteCritica.addEventListener('submit', salvarAjusteManual);

  // Modal Automação
  btnAbrirColeta.addEventListener('click', () => {
    abrirModal(modalColeta);
    verificarProgressoColeta();
  });
  btnFecharModalColeta.addEventListener('click', () => fecharModal(modalColeta));
  modalColeta.addEventListener('click', e => { if (e.target === modalColeta) fecharModal(modalColeta); });
  btnDispararColeta.addEventListener('click', iniciarColetaControlada);

  // CRUD Produto
  btnNovoProduto.addEventListener('click', () => abrirModalProduto());
  btnFecharModalProduto.addEventListener('click', () => fecharModal(modalCrudProduto));
  btnCancelarProduto.addEventListener('click', () => fecharModal(modalCrudProduto));
  modalCrudProduto.addEventListener('click', e => { if (e.target === modalCrudProduto) fecharModal(modalCrudProduto); });
  formCrudProduto.addEventListener('submit', salvarProduto);
  buscaCrudProduto.addEventListener('input', () => renderizarCrudProdutos());
  filtroCrudCategoria.addEventListener('change', () => renderizarCrudProdutos());

  // CRUD Mercado
  btnNovoMercado.addEventListener('click', () => abrirModalMercado());
  btnFecharModalMercado.addEventListener('click', () => fecharModal(modalCrudMercado));
  btnCancelarMercado.addEventListener('click', () => fecharModal(modalCrudMercado));
  modalCrudMercado.addEventListener('click', e => { if (e.target === modalCrudMercado) fecharModal(modalCrudMercado); });
  formCrudMercado.addEventListener('submit', salvarMercado);
  buscaCrudMercado.addEventListener('input', () => renderizarCrudMercados());
  filtroCrudSemana.addEventListener('change', () => renderizarCrudMercados());
}

function setModoVisualizacao(modo) {
  modoVisualizacao = modo;
  if (!btnModoCards || !btnModoMatriz) return;

  if (modo === 'cards') {
    btnModoCards.classList.add('active');
    btnModoMatriz.classList.remove('active');
    if (containerModoMatriz) containerModoMatriz.classList.add('hidden');
    if (containerModoCards) containerModoCards.classList.remove('hidden');
    renderizarCardsFocados();
  } else {
    btnModoMatriz.classList.add('active');
    btnModoCards.classList.remove('active');
    if (containerModoCards) containerModoCards.classList.add('hidden');
    if (containerModoMatriz) containerModoMatriz.classList.remove('hidden');
    renderizarTabela();
  }
}

function abrirModal(modal) { if (modal) modal.classList.remove('hidden'); }
function fecharModal(modal) {
  if (!modal) {
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    return;
  }
  modal.classList.add('hidden');
}

// Verifica se a nota fiscal foi emitida HOJE entre 05:00 e 21:00
function isNfeValidaHoje(dataStr) {
  if (!dataStr) return false;
  const d = new Date(dataStr);
  if (isNaN(d.getTime())) return false;
  const hoje = new Date();
  const mesmoDia = d.getDate() === hoje.getDate() && 
                   d.getMonth() === hoje.getMonth() && 
                   d.getFullYear() === hoje.getFullYear();
  const hora = d.getHours();
  return mesmoDia && hora >= 5 && hora <= 21;
}

// ==================== 1. STATUS & KPIS ====================
async function carregarStatus() {
  try {
    const res = await fetch('/api/status');
    const json = await res.json();
    if (!json.success) return;

    const d = json.data;
    if (kpiMercados) kpiMercados.textContent = d.total_estabelecimentos || 40;
    if (kpiProdutos) kpiProdutos.textContent = d.total_produtos || 152;
    if (kpiPrecosHoje) kpiPrecosHoje.textContent = d.total_precos_hoje ?? d.total_precos_coletados ?? 0;
    if (kpiPendentesHoje) kpiPendentesHoje.textContent = d.total_pendentes_hoje ?? (d.total_produtos - (d.total_precos_hoje || 0));
    if (kpiAlertas) kpiAlertas.textContent = d.total_alertas_outliers || 0;
    if (kpiConferidos) kpiConferidos.textContent = d.total_conferidos || 0;

    if (json.coletaAtiva?.emExecucao) {
      iniciarPollingProgresso();
    }
  } catch (err) {
    console.error('Erro ao carregar status:', err);
  }
}

// ==================== 2. MATRIZ DE COLETA & CRÍTICA ====================
async function popularFiltroMercados() {
  try {
    const res = await fetch('/api/estabelecimentos');
    const json = await res.json();
    if (!json.success || !json.data) return;

    crudMercadosList = json.data;
    const valorAtual = filtroMercado.value;
    filtroMercado.innerHTML = '<option value="">Todos os Mercados (M1 a M40)</option>';

    json.data.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.codigo_planilha;
      opt.textContent = `${m.codigo_planilha} - ${m.nome} (${m.bairro || 'VCA'})`;
      if (m.codigo_planilha === valorAtual) opt.selected = true;
      filtroMercado.appendChild(opt);
    });
  } catch (err) {
    console.error('Erro ao popular mercados no filtro:', err);
  }
}

async function carregarMatriz() {
  try {
    tbodyMatriz.innerHTML = `<tr><td colspan="15" class="loading-td">Carregando matriz de dados...</td></tr>`;

    const params = new URLSearchParams();
    if (filtroSemana && filtroSemana.value) params.append('semana', filtroSemana.value);
    if (filtroMercado.value) params.append('mercado', filtroMercado.value);
    if (filtroDiaSemana.value) params.append('diaSemana', filtroDiaSemana.value);
    if (filtroDataColeta.value) params.append('dataColeta', filtroDataColeta.value);
    if (filtroCategoria.value) params.append('categoria', filtroCategoria.value);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/matriz${queryStr}`);
    const json = await res.json();

    if (!json.success) {
      tbodyMatriz.innerHTML = `<tr><td colspan="15" class="cell-alert">Erro ao carregar matriz: ${json.error}</td></tr>`;
      return;
    }

    appData = json.data;
    popularCategoriasSelect(appData.produtos);
    renderizarCabecalhoTabela(appData.estabelecimentos);

    if (modoVisualizacao === 'cards') {
      renderizarCardsFocados();
    } else {
      renderizarTabela();
    }
  } catch (err) {
    tbodyMatriz.innerHTML = `<tr><td colspan="15" class="cell-alert">Falha na conexão com a API local: ${err.message}</td></tr>`;
  }
}

function limparTodosFiltros() {
  filtroSemana.value = '';
  filtroMercado.value = '';
  filtroDiaSemana.value = '';
  filtroDataColeta.value = '';
  filtroCategoria.value = '';
  filtroStatusConferencia.value = '';
  buscaTexto.value = '';
  carregarMatriz();
}

function popularCategoriasSelect(produtos) {
  const categorias = [...new Set(produtos.map(p => p.categoria).filter(Boolean))];
  const valorAtual = filtroCategoria.value;
  filtroCategoria.innerHTML = '<option value="">Todas as Categorias</option>';
  filtroCrudCategoria.innerHTML = '<option value="">Todas as Categorias</option>';

  categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === valorAtual) opt.selected = true;
    filtroCategoria.appendChild(opt);

    const optCrud = opt.cloneNode(true);
    filtroCrudCategoria.appendChild(optCrud);
  });
}

function renderizarCabecalhoTabela(estabelecimentos) {
  const fixedColsHtml = `
    <th class="col-sticky col-item">Item / Produto</th>
    <th class="col-sticky col-codigo">Código</th>
    <th class="col-sticky col-marca">Marca / Especificação</th>
    <th class="col-sticky col-gtin">Cód. Barras</th>
    <th class="col-sticky col-media-ant">Média Ant.</th>
  `;

  const mercadosColsHtml = estabelecimentos.map(e => {
    const endereco = e.endereco_completo || `${e.bairro || 'Centro'}, Vitória da Conquista - BA`;
    const cnpjFmt = e.cnpj ? formatarCnpj(e.cnpj) : 'CNPJ não informado';
    const tooltipText = `🏪 Estabelecimento: ${e.codigo_planilha} - ${e.nome}
📍 Endereço Completo: ${endereco}
🏢 CNPJ: ${cnpjFmt}
📅 Dia de Coleta DIEESE: ${e.dia_semana || 'Não informado'}
🗓️ Semana DIEESE: Semana ${e.semana_coleta || '—'}`;

    return `
    <th class="th-mercado" title="${escapeHtml(tooltipText)}">
      <span class="th-mercado-cod" title="${escapeHtml(tooltipText)}">${escapeHtml(e.codigo_planilha)}</span>
      <span class="th-mercado-nome" title="${escapeHtml(tooltipText)}">${escapeHtml(e.nome)}</span>
      <span class="th-mercado-bairro" title="${escapeHtml(endereco)}">📍 ${escapeHtml(e.bairro || 'VCA')}</span>
    </th>
  `;
  }).join('');

  const resumoColsHtml = `
    <th class="th-resumo">Média Atual</th>
    <th class="th-resumo">Mínimo</th>
    <th class="th-resumo">Máximo</th>
    <th class="th-resumo">Qtd</th>
  `;

  theadRow1.innerHTML = fixedColsHtml + mercadosColsHtml + resumoColsHtml;
}

function renderizarTabela() {
  const { produtos, estabelecimentos, precosMap } = appData;
  const termoBusca = buscaTexto.value.toLowerCase().trim();
  const catSelecionada = filtroCategoria.value;
  const statusFiltro = filtroStatusConferencia.value;

  let produtosFiltrados = produtos.filter(p => {
    if (catSelecionada && p.categoria !== catSelecionada) return false;
    if (termoBusca) {
      const texto = `${p.item_cesta} ${p.marca_especificacao} ${p.codigo_produto} ${p.gtin || ''}`.toLowerCase();
      if (!texto.includes(termoBusca)) return false;
    }
    return true;
  });

  if (statusFiltro) {
    produtosFiltrados = produtosFiltrados.filter(p => {
      return estabelecimentos.some(e => {
        const preco = precosMap[`${p.id}_${e.id}`];
        if (!preco) return false;
        if (statusFiltro === 'ALERTA') return preco.alerta_outlier;
        return preco.status_conferencia === statusFiltro;
      });
    });
  }

  if (produtosFiltrados.length === 0) {
    tbodyMatriz.innerHTML = `<tr><td colspan="${5 + estabelecimentos.length + 4}" class="cell-empty" style="padding: 2.5rem;">Nenhum produto encontrado com os filtros selecionados.</td></tr>`;
    return;
  }

  let html = '';
  let ultimaCategoria = '';

  produtosFiltrados.forEach(prod => {
    if (prod.categoria && prod.categoria !== ultimaCategoria) {
      ultimaCategoria = prod.categoria;
      html += `
        <tr class="category-row">
          <td colspan="${5 + estabelecimentos.length + 4}">
            📂 ${escapeHtml(prod.categoria)}
          </td>
        </tr>
      `;
    }

    const mediaAntFormatada = prod.media_anterior 
      ? `R$ ${Number(prod.media_anterior).toFixed(2)}` 
      : '—';

    const precosLinha = [];
    const precosCelsHtml = estabelecimentos.map(est => {
      const precoObj = precosMap[`${prod.id}_${est.id}`];

      if (!precoObj) {
        return `<td class="cell-empty" title="Ainda não pesquisado neste mercado">—</td>`;
      }

      const apenasHojeAtivo = document.getElementById('checkApenasHoje')?.checked;
      if (apenasHojeAtivo) {
        const emitidoHoje = isNfeValidaHoje(precoObj.data_emissao_nfe);
        if (!emitidoHoje) {
          const tooltipAguardando = `⏳ Aguardando Venda de Hoje\n• Estabelecimento: ${est.codigo_planilha} - ${est.nome}\n• Nenhuma nota registrada hoje entre 05:00 e 21:00.\n• Programado para a próxima rodada de re-tentativa.`;
          return `<td class="cell-empty" style="cursor: help; color: #94a3b8;" title="${escapeHtml(tooltipAguardando)}">⏳</td>`;
        }
      }

      if (precoObj.status_conferencia === 'NAO_ENCONTRADO' || !precoObj.preco_final_coletado || Number(precoObj.preco_final_coletado) <= 0) {
        const horaColeta = precoObj.data_coleta ? new Date(precoObj.data_coleta).toLocaleString('pt-BR') : '';
        const tooltipNao = `✕ Não Encontrado na SEFAZ\n• Estabelecimento: ${est.codigo_planilha} - ${est.nome}\n• Consulta realizada pelo robô: ${horaColeta}\n• Sem emissão de notas fiscais nas últimas 72h para este item.`;
        return `<td class="cell-nao-encontrado" title="${escapeHtml(tooltipNao)}">✕</td>`;
      }

      const precoNum = Number(precoObj.preco_final_coletado);
      precosLinha.push(precoNum);

      const isAlert = precoObj.alerta_outlier;
      const isConferido = precoObj.status_conferencia === 'CONFERIDO';
      const isAjustado = precoObj.status_conferencia === 'AJUSTADO';

      let classCell = 'cell-price';
      let statusIcon = '';

      if (isAlert) {
        classCell += ' cell-alert';
        statusIcon = ' ⚠️';
      } else if (isConferido) {
        classCell += ' cell-conferido';
        statusIcon = ' ✓';
      } else if (isAjustado) {
        classCell += ' cell-ajustado';
        statusIcon = ' ✏️';
      } else {
        classCell += ' cell-valid';
      }

      // Tooltip informativo com Horário da Coleta e Horário da NFC-e
      const horaColeta = precoObj.data_coleta ? new Date(precoObj.data_coleta).toLocaleString('pt-BR') : 'Recente';
      const horaNfe = precoObj.data_emissao_nfe ? new Date(precoObj.data_emissao_nfe).toLocaleString('pt-BR') : (precoObj.intervalo_tempo || 'Recente');
      const tooltip = `R$ ${precoNum.toFixed(2)}${statusIcon}\n• Coletado pelo Robô: ${horaColeta}\n• Venda na NFC-e: ${horaNfe}\n• Status: ${precoObj.status_conferencia || 'PENDENTE'}\n(Clique para auditar)`;

      return `
        <td class="${classCell}" title="${escapeHtml(tooltip)}" onclick="abrirModalCritica(${precoObj.id})">
          R$ ${precoNum.toFixed(2)}${statusIcon}
        </td>
      `;
    }).join('');

    // Cálculos de Resumos
    let mediaAtual = '—';
    let minAtual = '—';
    let maxAtual = '—';
    const qtdColetada = precosLinha.length;

    if (qtdColetada > 0) {
      const soma = precosLinha.reduce((acc, v) => acc + v, 0);
      mediaAtual = `R$ ${(soma / qtdColetada).toFixed(2)}`;
      minAtual = `R$ ${Math.min(...precosLinha).toFixed(2)}`;
      maxAtual = `R$ ${Math.max(...precosLinha).toFixed(2)}`;
    }

    html += `
      <tr>
        <td class="col-sticky col-item">${escapeHtml(prod.item_cesta || '—')}</td>
        <td class="col-sticky col-codigo">${escapeHtml(prod.codigo_produto || '—')}</td>
        <td class="col-marca">${escapeHtml(prod.marca_especificacao || '—')}</td>
        <td class="col-gtin">${escapeHtml(prod.gtin || 'Granel')}</td>
        <td class="col-media-ant">${mediaAntFormatada}</td>
        ${precosCelsHtml}
        <td class="td-resumo">${mediaAtual}</td>
        <td class="td-resumo">${minAtual}</td>
        <td class="td-resumo">${maxAtual}</td>
        <td class="td-resumo">${qtdColetada}</td>
      </tr>
    `;
  });

  tbodyMatriz.innerHTML = html;
}

// ==================== VISÃO FOCADA / MODO CARTÕES ====================
function renderizarCardsFocados() {
  if (!cardsGridProdutos) return;

  const { produtos, estabelecimentos, precosMap } = appData;
  const termoBusca = buscaTexto.value.toLowerCase().trim();
  const catSelecionada = filtroCategoria.value;
  const statusFiltro = filtroStatusConferencia.value;
  const apenasHojeAtivo = document.getElementById('checkApenasHoje')?.checked;
  const mercadoFiltroVal = filtroMercado.value;

  // Mercado selecionado para foco (se vazio, usa o primeiro estabelecimento ou o que o usuário escolher)
  let mercadoFoco = estabelecimentos.find(e => e.codigo_planilha === mercadoFiltroVal || String(e.id) === String(mercadoFiltroVal));
  if (!mercadoFoco && estabelecimentos.length > 0) {
    mercadoFoco = estabelecimentos[0];
  }

  if (focusedHeaderMercado && mercadoFoco) {
    const cnpjFmt = mercadoFoco.cnpj ? formatarCnpj(mercadoFoco.cnpj) : 'CNPJ não informado';
    const endFmt = mercadoFoco.endereco_completo || `${mercadoFoco.bairro || 'Centro'}, Vitória da Conquista - BA`;
    focusedHeaderMercado.innerHTML = `
      <div class="focused-mercado-title">
        <span>🏪 [${escapeHtml(mercadoFoco.codigo_planilha)}] ${escapeHtml(mercadoFoco.nome)}</span>
      </div>
      <div class="focused-mercado-sub">
        📍 ${escapeHtml(endFmt)} &nbsp;|&nbsp; 🏢 ${escapeHtml(cnpjFmt)} &nbsp;|&nbsp; 📅 Semana ${mercadoFoco.semana_coleta || '—'} (${escapeHtml(mercadoFoco.dia_semana || '')})
      </div>
    `;
  }

  let produtosFiltrados = produtos.filter(p => {
    if (catSelecionada && p.categoria !== catSelecionada) return false;
    if (termoBusca) {
      const texto = `${p.item_cesta} ${p.marca_especificacao} ${p.codigo_produto} ${p.gtin || ''}`.toLowerCase();
      if (!texto.includes(termoBusca)) return false;
    }
    return true;
  });

  if (statusFiltro && mercadoFoco) {
    produtosFiltrados = produtosFiltrados.filter(p => {
      const preco = precosMap[`${p.id}_${mercadoFoco.id}`];
      if (!preco) return false;
      if (statusFiltro === 'ALERTA') return preco.alerta_outlier;
      return preco.status_conferencia === statusFiltro;
    });
  }

  if (produtosFiltrados.length === 0) {
    cardsGridProdutos.innerHTML = `
      <div class="cell-empty" style="grid-column: 1 / -1; padding: 2.5rem; text-align: center; background: white; border-radius: 8px;">
        Nenhum produto encontrado com os filtros selecionados.
      </div>
    `;
    return;
  }

  let htmlCards = '';
  produtosFiltrados.forEach(prod => {
    const precoObj = mercadoFoco ? precosMap[`${prod.id}_${mercadoFoco.id}`] : null;
    let precoValHtml = '<span class="card-price-val pending">⏳ Aguardando Venda</span>';
    let statusBadge = '<span class="status-badge badge-nao-encontrado">Sem Venda</span>';
    let horaNfeStr = 'Nenhum cupom hoje (05h às 21h)';
    let precoIdAudit = null;

    if (precoObj && precoObj.preco_final_coletado && Number(precoObj.preco_final_coletado) > 0) {
      const emitidoHoje = isNfeValidaHoje(precoObj.data_emissao_nfe);
      if (!apenasHojeAtivo || emitidoHoje) {
        const val = Number(precoObj.preco_final_coletado).toFixed(2);
        precoIdAudit = precoObj.id;
        
        if (precoObj.alerta_outlier) {
          statusBadge = '<span class="status-badge badge-alerta">🔴 Alerta >50%</span>';
          precoValHtml = `<span class="card-price-val alert">R$ ${val}</span>`;
        } else if (precoObj.status_conferencia === 'CONFERIDO') {
          statusBadge = '<span class="status-badge badge-conferido">🟢 Conferido</span>';
          precoValHtml = `<span class="card-price-val">R$ ${val}</span>`;
        } else if (precoObj.status_conferencia === 'AJUSTADO') {
          statusBadge = '<span class="status-badge badge-ajustado">🔵 Ajustado</span>';
          precoValHtml = `<span class="card-price-val">R$ ${val}</span>`;
        } else {
          statusBadge = '<span class="status-badge badge-pendente">🟡 Pendente</span>';
          precoValHtml = `<span class="card-price-val">R$ ${val}</span>`;
        }

        const dataNfe = precoObj.data_emissao_nfe ? new Date(precoObj.data_emissao_nfe).toLocaleString('pt-BR') : 'Hoje';
        horaNfeStr = `NFC-e emitida: ${dataNfe}`;
      }
    }

    const mediaAnt = prod.media_anterior ? `R$ ${Number(prod.media_anterior).toFixed(2)}` : '—';

    htmlCards += `
      <div class="product-clean-card">
        <div class="card-top">
          <div>
            <div class="card-item-title">${escapeHtml(prod.item_cesta)}</div>
            <div class="card-marca-spec">${escapeHtml(prod.marca_especificacao)}</div>
          </div>
          <span class="card-code-pill">${escapeHtml(prod.codigo_produto)}</span>
        </div>
        <div class="card-category">${escapeHtml(prod.categoria || '')} ${prod.gtin ? `• GTIN: ${prod.gtin}` : ''}</div>
        <div class="card-price-row">
          <div>${precoValHtml}</div>
          <div>${statusBadge}</div>
        </div>
        <div class="card-actions">
          <span>${horaNfeStr}</span>
          ${precoIdAudit ? `<button type="button" class="btn btn-sm btn-secondary" onclick="abrirModalCritica(${precoIdAudit})">Auditar</button>` : `<span class="text-muted">Média ant: ${mediaAnt}</span>`}
        </div>
      </div>
    `;
  });

  cardsGridProdutos.innerHTML = htmlCards;
}

// ==================== 3. MODAL DE CRÍTICA & AUDITORIA ====================
async function abrirModalCritica(precoId) {
  try {
    appData.precoSelecionadoId = precoId;
    const res = await fetch(`/api/precos/${precoId}`);
    const json = await res.json();
    if (!json.success) return alert('Erro ao carregar detalhes do preço.');

    const d = json.data;

    document.getElementById('modalMercadoItemTitle').textContent = `${d.mercado_codigo} - ${d.mercado_nome} | ${d.marca_especificacao}`;
    
    // Rastreabilidade Temporal
    const horaColetaStr = d.data_coleta ? new Date(d.data_coleta).toLocaleString('pt-BR') : 'Momento da busca';
    const horaNfeStr = d.data_emissao_nfe ? new Date(d.data_emissao_nfe).toLocaleString('pt-BR') : 'Nota recente';
    
    document.getElementById('modalDataColeta').textContent = horaColetaStr;
    document.getElementById('modalDataNfe').textContent = horaNfeStr;
    document.getElementById('modalIntervaloTempo').textContent = d.intervalo_tempo || '72h';

    // Status de Conferência Badge
    const statusBadge = document.getElementById('modalBadgeStatusConferencia');
    statusBadge.className = 'status-badge';
    if (d.status_conferencia === 'CONFERIDO') {
      statusBadge.classList.add('badge-conferido');
      statusBadge.textContent = `🟢 Conferido por ${d.conferido_por || 'Crítico'}`;
    } else if (d.status_conferencia === 'AJUSTADO') {
      statusBadge.classList.add('badge-ajustado');
      statusBadge.textContent = `🔵 Ajustado manualmente`;
    } else if (d.alerta_outlier) {
      statusBadge.classList.add('badge-alerta');
      statusBadge.textContent = `🔴 Alerta >50% (Pendente)`;
    } else {
      statusBadge.classList.add('badge-pendente');
      statusBadge.textContent = `🟡 Pendente de Conferência`;
    }

    // Dados NFC-e
    document.getElementById('modalNomeEstabelecimento').textContent = d.nome_estabelecimento_nfe || d.mercado_nome;
    document.getElementById('modalCnpjEstabelecimento').textContent = d.cnpj_estabelecimento ? formatarCnpj(d.cnpj_estabelecimento) : 'Não informado';
    document.getElementById('modalEnderecoEstabelecimento').textContent = d.endereco_estabelecimento_nfe || `${d.mercado_bairro} - Vitória da Conquista`;
    document.getElementById('modalDescricaoNfe').textContent = d.descricao_nfe || d.marca_especificacao;
    document.getElementById('modalUnidadeNfe').textContent = d.unidade_medida_nfe || 'UN';

    // Preços
    document.getElementById('modalPrecoBruto').textContent = d.preco_bruto_nfe ? `R$ ${Number(d.preco_bruto_nfe).toFixed(2)}` : `R$ ${Number(d.preco_final_coletado).toFixed(2)}`;
    document.getElementById('modalPrecoLiquido').textContent = d.preco_liquido_nfe ? `R$ ${Number(d.preco_liquido_nfe).toFixed(2)}` : 'Sem desconto';
    document.getElementById('modalDesconto').textContent = d.desconto_nfe ? `Desconto: R$ ${Number(d.desconto_nfe).toFixed(2)}` : 'Desconto: R$ 0,00';

    // Foto SEFAZ
    const fotoCont = document.getElementById('modalProdutoFotoContainer');
    const fotoImg = document.getElementById('modalProdutoFoto');
    const rawPayload = d.raw_payload;

    if (rawPayload?.produto?.foto) {
      fotoImg.src = rawPayload.produto.foto;
      fotoCont.classList.remove('hidden');
    } else {
      fotoCont.classList.add('hidden');
    }

    // Alerta Outlier
    const alertBox = document.getElementById('modalAlertBox');
    if (d.alerta_outlier) {
      alertBox.classList.remove('hidden');
      document.getElementById('modalMotivoAlerta').textContent = d.motivo_alerta || `Preço atual R$ ${Number(d.preco_final_coletado).toFixed(2)} excede em 50% a média anterior de R$ ${Number(d.media_anterior).toFixed(2)}.`;
    } else {
      alertBox.classList.add('hidden');
    }

    // Formulário
    document.getElementById('inputPrecoAjustado').value = Number(d.preco_final_coletado).toFixed(2);
    document.getElementById('inputObsCritica').value = d.observacao_conferencia || '';

    // Raw JSON
    document.getElementById('modalRawJson').textContent = JSON.stringify(d.raw_payload, null, 2);

    abrirModal(modalCritica);
  } catch (err) {
    console.error('Erro ao abrir crítica:', err);
  }
}

async function aprovarPrecoAtual() {
  if (!appData.precoSelecionadoId) return;

  try {
    const obs = document.getElementById('inputObsCritica').value;

    const res = await fetch(`/api/precos/${appData.precoSelecionadoId}/critica`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        statusConferencia: 'CONFERIDO',
        conferidoPor: 'Auditoria DIEESE',
        observacao: obs || 'Preço e especificação auditados e aprovados.'
      })
    });

    const json = await res.json();
    if (json.success) {
      fecharModal(modalCritica);
      await carregarStatus();
      await carregarMatriz();
    }
  } catch (err) {
    alert('Erro ao aprovar preço: ' + err.message);
  }
}

async function descartarPrecoIncoerente() {
  if (!appData.precoSelecionadoId) return;

  const confirmar = confirm('⚠️ Deseja realmente DESCARTAR este preço incoerente?\n\nEle será removido definitivamente do banco de dados e as médias da DIEESE serão recalculadas.');
  if (!confirmar) return;

  try {
    const res = await fetch(`/api/precos/${appData.precoSelecionadoId}`, {
      method: 'DELETE'
    });

    const json = await res.json();
    if (json.success) {
      fecharModal(modalCritica);
      await carregarStatus();
      await carregarMatriz();
      alert('✓ Preço incoerente descartado e excluído com sucesso!');
    } else {
      alert(`Erro ao descartar: ${json.message || json.error}`);
    }
  } catch (err) {
    alert('Erro de comunicação ao descartar preço: ' + err.message);
  }
}

async function salvarAjusteManual(e) {
  e.preventDefault();
  if (!appData.precoSelecionadoId) return;

  const novoPreco = document.getElementById('inputPrecoAjustado').value;
  const obs = document.getElementById('inputObsCritica').value;

  if (!novoPreco || isNaN(novoPreco)) return alert('Informe um preço válido.');

  try {
    const res = await fetch(`/api/precos/${appData.precoSelecionadoId}/critica`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        precoAjustado: novoPreco,
        statusConferencia: 'AJUSTADO',
        conferidoPor: 'Auditoria DIEESE',
        observacao: obs || 'Preço corrigido manualmente na crítica.'
      })
    });

    const json = await res.json();
    if (json.success) {
      fecharModal(modalCritica);
      await carregarStatus();
      await carregarMatriz();
    }
  } catch (err) {
    alert('Erro ao salvar ajuste: ' + err.message);
  }
}

// ==================== 4. CRUD DE PRODUTOS ====================
async function carregarCrudProdutos() {
  try {
    tbodyCrudProdutos.innerHTML = `<tr><td colspan="9" class="loading-td">Carregando catálogo de produtos...</td></tr>`;
    const res = await fetch('/api/produtos');
    const json = await res.json();
    if (!json.success) return;

    crudProdutosList = json.data;
    renderizarCrudProdutos();
  } catch (err) {
    console.error('Erro ao carregar produtos:', err);
  }
}

function renderizarCrudProdutos() {
  const busca = buscaCrudProduto.value.toLowerCase().trim();
  const cat = filtroCrudCategoria.value;

  const filtrados = crudProdutosList.filter(p => {
    if (cat && p.categoria !== cat) return false;
    if (busca) {
      const txt = `${p.codigo_produto} ${p.categoria} ${p.item_cesta} ${p.marca_especificacao} ${p.gtin || ''}`.toLowerCase();
      if (!txt.includes(busca)) return false;
    }
    return true;
  });

  if (filtrados.length === 0) {
    tbodyCrudProdutos.innerHTML = `<tr><td colspan="9" class="cell-empty" style="padding: 2rem; text-align: center;">Nenhum produto encontrado.</td></tr>`;
    return;
  }

  tbodyCrudProdutos.innerHTML = filtrados.map(p => `
    <tr>
      <td class="mono font-bold">${escapeHtml(p.codigo_produto)}</td>
      <td>${escapeHtml(p.categoria)}</td>
      <td><strong>${escapeHtml(p.item_cesta)}</strong></td>
      <td>${escapeHtml(p.marca_especificacao)}</td>
      <td class="mono">${escapeHtml(p.gtin || 'Granel')}</td>
      <td><span class="badge-tag">${p.tipo_busca}</span></td>
      <td>${escapeHtml(p.regra_calculo || 'PADRAO')}</td>
      <td>${p.ativo ? '🟢 Ativo' : '⚪ Inativo'}</td>
      <td>
        <div class="crud-actions">
          <button class="btn btn-sm btn-secondary" onclick="editarProduto(${p.id})" title="Editar">✏️ Editar</button>
          <button class="btn btn-sm btn-danger" onclick="desativarProduto(${p.id})" title="Desativar">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function abrirModalProduto(prod = null) {
  document.getElementById('modalProdutoTitle').textContent = prod ? 'Editar Produto' : 'Cadastrar Novo Produto';
  document.getElementById('prodId').value = prod ? prod.id : '';
  document.getElementById('prodCodigo').value = prod ? prod.codigo_produto : '';
  document.getElementById('prodCategoria').value = prod ? prod.categoria : '';
  document.getElementById('prodItem').value = prod ? prod.item_cesta : '';
  document.getElementById('prodMarca').value = prod ? prod.marca_especificacao : '';
  document.getElementById('prodGtin').value = prod ? (prod.gtin || '') : '';
  document.getElementById('prodTipoBusca').value = prod ? prod.tipo_busca : 'GTIN';
  document.getElementById('prodRegraCalculo').value = prod ? prod.regra_calculo : 'PADRAO';
  document.getElementById('prodUnidade').value = prod ? prod.unidade_medida : 'UN';

  abrirModal(modalCrudProduto);
}

function editarProduto(id) {
  const prod = crudProdutosList.find(p => p.id === id);
  if (prod) abrirModalProduto(prod);
}

async function salvarProduto(e) {
  e.preventDefault();
  const id = document.getElementById('prodId').value;
  const payload = {
    codigo_produto: document.getElementById('prodCodigo').value.trim(),
    categoria: document.getElementById('prodCategoria').value.trim(),
    item_cesta: document.getElementById('prodItem').value.trim(),
    marca_especificacao: document.getElementById('prodMarca').value.trim(),
    gtin: document.getElementById('prodGtin').value.trim() || null,
    tipo_busca: document.getElementById('prodTipoBusca').value,
    regra_calculo: document.getElementById('prodRegraCalculo').value,
    unidade_medida: document.getElementById('prodUnidade').value.trim()
  };

  try {
    const url = id ? `/api/produtos/${id}` : '/api/produtos';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (json.success) {
      fecharModal(modalCrudProduto);
      await carregarCrudProdutos();
      await carregarStatus();
    } else {
      alert('Erro: ' + json.message);
    }
  } catch (err) {
    alert('Erro ao salvar produto: ' + err.message);
  }
}

async function desativarProduto(id) {
  if (!confirm('Deseja desativar este produto do catálogo?')) return;
  try {
    const res = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      await carregarCrudProdutos();
      await carregarStatus();
    }
  } catch (err) {
    alert('Erro ao desativar: ' + err.message);
  }
}

// ==================== 5. CRUD DE MERCADOS ====================
async function carregarCrudMercados() {
  try {
    tbodyCrudMercados.innerHTML = `<tr><td colspan="9" class="loading-td">Carregando estabelecimentos...</td></tr>`;
    const res = await fetch('/api/estabelecimentos');
    const json = await res.json();
    if (!json.success) return;

    crudMercadosList = json.data;
    renderizarCrudMercados();
  } catch (err) {
    console.error('Erro ao carregar mercados:', err);
  }
}

function renderizarCrudMercados() {
  const busca = buscaCrudMercado.value.toLowerCase().trim();
  const semana = filtroCrudSemana.value;

  const filtrados = crudMercadosList.filter(m => {
    if (semana && String(m.semana_coleta) !== semana) return false;
    if (busca) {
      const txt = `${m.codigo_planilha} ${m.nome} ${m.bairro || ''} ${m.cnpj || ''}`.toLowerCase();
      if (!txt.includes(busca)) return false;
    }
    return true;
  });

  if (filtrados.length === 0) {
    tbodyCrudMercados.innerHTML = `<tr><td colspan="9" class="cell-empty" style="padding: 2rem; text-align: center;">Nenhum mercado encontrado.</td></tr>`;
    return;
  }

  tbodyCrudMercados.innerHTML = filtrados.map(m => `
    <tr>
      <td class="font-bold highlight-blue">${escapeHtml(m.codigo_planilha)}</td>
      <td><strong>${escapeHtml(m.nome)}</strong></td>
      <td>${escapeHtml(m.bairro || 'Vitória da Conquista')}</td>
      <td class="mono">${m.cnpj ? formatarCnpj(m.cnpj) : '<span class="text-muted">A descobrir</span>'}</td>
      <td><span class="badge-tag">Semana ${m.semana_coleta || 1}</span></td>
      <td>${escapeHtml(m.dia_semana || '—')}</td>
      <td><strong>${escapeHtml(m.critica || 'Validador Padrão')}</strong></td>
      <td>
        <div class="crud-actions">
          <button class="btn btn-sm btn-secondary" onclick="editarMercado(${m.id})" title="Editar">✏️ Editar</button>
          <button class="btn btn-sm btn-danger" onclick="desativarMercado(${m.id})" title="Desativar">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function abrirModalMercado(merc = null) {
  document.getElementById('modalMercadoTitle').textContent = merc ? 'Editar Estabelecimento' : 'Cadastrar Estabelecimento';
  document.getElementById('mercId').value = merc ? merc.id : '';
  document.getElementById('mercCodigo').value = merc ? merc.codigo_planilha : '';
  document.getElementById('mercNome').value = merc ? merc.nome : '';
  document.getElementById('mercBairro').value = merc ? (merc.bairro || '') : '';
  document.getElementById('mercCnpj').value = merc ? (merc.cnpj || '') : '';
  document.getElementById('mercSemana').value = merc ? merc.semana_coleta : '1';
  document.getElementById('mercDia').value = merc ? merc.dia_semana : 'Segunda-Feira';
  document.getElementById('mercCritica').value = merc ? (merc.critica || '') : '';

  abrirModal(modalCrudMercado);
}

function editarMercado(id) {
  const merc = crudMercadosList.find(m => m.id === id);
  if (merc) abrirModalMercado(merc);
}

async function salvarMercado(e) {
  e.preventDefault();
  const id = document.getElementById('mercId').value;
  const payload = {
    codigo_planilha: document.getElementById('mercCodigo').value.trim(),
    nome: document.getElementById('mercNome').value.trim(),
    bairro: document.getElementById('mercBairro').value.trim(),
    cnpj: document.getElementById('mercCnpj').value.trim(),
    semana_coleta: document.getElementById('mercSemana').value,
    dia_semana: document.getElementById('mercDia').value,
    critica: document.getElementById('mercCritica').value.trim()
  };

  try {
    const url = id ? `/api/estabelecimentos/${id}` : '/api/estabelecimentos';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (json.success) {
      fecharModal(modalCrudMercado);
      await carregarCrudMercados();
      await carregarStatus();
    } else {
      alert('Erro: ' + json.message);
    }
  } catch (err) {
    alert('Erro ao salvar mercado: ' + err.message);
  }
}

async function desativarMercado(id) {
  if (!confirm('Deseja desativar este estabelecimento comercial?')) return;
  try {
    const res = await fetch(`/api/estabelecimentos/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      await carregarCrudMercados();
      await carregarStatus();
    }
  } catch (err) {
    alert('Erro ao desativar mercado: ' + err.message);
  }
}

// ==================== 6. AUTOMAÇÃO DE COLETA ====================
async function iniciarColetaControlada() {
  const semana = coletaSemana.value;
  const limite = coletaLimite.value;
  const minDelayMs = coletaDelayMin.value;
  const maxDelayMs = coletaDelayMax.value;

  try {
    btnDispararColeta.disabled = true;
    btnDispararColeta.textContent = 'Iniciando pipeline...';

    const res = await fetch('/api/coleta/iniciar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ semana, limite, minDelayMs, maxDelayMs })
    });

    const json = await res.json();
    if (!json.success) {
      alert(json.message);
      btnDispararColeta.disabled = false;
      btnDispararColeta.textContent = '▶ Iniciar Execução Controlada';
      return;
    }

    iniciarPollingProgresso();
  } catch (err) {
    alert('Erro ao iniciar coleta: ' + err.message);
    btnDispararColeta.disabled = false;
    btnDispararColeta.textContent = '▶ Iniciar Execução Controlada';
  }
}

function iniciarPollingProgresso() {
  if (pollingInterval) clearInterval(pollingInterval);
  btnDispararColeta.disabled = true;
  btnDispararColeta.textContent = '⏳ Coleta em Andamento...';

  pollingInterval = setInterval(verificarProgressoColeta, 1500);
  verificarProgressoColeta();
}

async function verificarProgressoColeta() {
  try {
    const res = await fetch('/api/coleta/progresso');
    const json = await res.json();
    if (!json.success) return;

    const data = json.data;

    statusText.textContent = data.emExecucao ? 'Status: Coletando na SEFAZ...' : 'Status: Concluído';
    percentText.textContent = `${data.progresso}% (${data.atual}/${data.total})`;
    progressBar.style.width = `${data.progresso}%`;
    itemAtualText.textContent = data.itemAtual || 'Ocioso';

    if (data.logs && data.logs.length > 0) {
      terminalLogs.innerHTML = data.logs.map(l => `<div class="log-line">${escapeHtml(l)}</div>`).join('');
    }

    if (!data.emExecucao && pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
      btnDispararColeta.disabled = false;
      btnDispararColeta.textContent = '▶ Iniciar Nova Coleta';
      carregarStatus();
      carregarMatriz();
    }
  } catch (err) {
    console.warn('Falha no polling de progresso:', err);
  }
}

// Helpers
function formatarCnpj(cnpj) {
  const c = String(cnpj).replace(/\D/g, '');
  if (c.length !== 14) return cnpj;
  return c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

window.abrirModalCritica = abrirModalCritica;
window.editarProduto = editarProduto;
window.desativarProduto = desativarProduto;
window.editarMercado = editarMercado;
window.desativarMercado = desativarMercado;

// ==================== 7. HISTÓRICO & LOGS DE EXECUÇÕES ====================
async function carregarHistoricoExecucoes() {
  const tbody = document.getElementById('tbodyHistoricoExecucoes');
  if (!tbody) return;

  try {
    tbody.innerHTML = `<tr><td colspan="9" class="loading-td">Carregando execuções do dia...</td></tr>`;
    const res = await fetch('/api/execucoes');
    const json = await res.json();
    if (!json.success) {
      tbody.innerHTML = `<tr><td colspan="9" class="cell-alert">Erro ao carregar execuções: ${json.error}</td></tr>`;
      return;
    }

    const { runs, resumoHoje } = json.data;

    // Atualizar KPIs da aba
    const lotesHoje = Number(resumoHoje?.total_lotes_hoje || 0);
    const buscasHoje = Number(resumoHoje?.total_buscas_hoje || 0);
    const encHoje = Number(resumoHoje?.total_encontrados_hoje || 0);
    const naoEncHoje = Number(resumoHoje?.total_nao_encontrados_hoje || 0);

    const logKpiLotes = document.getElementById('logKpiLotes');
    const logKpiBuscas = document.getElementById('logKpiBuscas');
    const logKpiEncontrados = document.getElementById('logKpiEncontrados');
    const logKpiNaoEncontrados = document.getElementById('logKpiNaoEncontrados');
    const logKpiTaxaSucesso = document.getElementById('logKpiTaxaSucesso');

    if (logKpiLotes) logKpiLotes.textContent = lotesHoje;
    if (logKpiBuscas) logKpiBuscas.textContent = buscasHoje;
    if (logKpiEncontrados) logKpiEncontrados.textContent = encHoje;
    if (logKpiNaoEncontrados) logKpiNaoEncontrados.textContent = naoEncHoje;

    if (logKpiTaxaSucesso) {
      const taxa = buscasHoje > 0 ? ((encHoje / buscasHoje) * 100).toFixed(0) : 0;
      logKpiTaxaSucesso.textContent = `Taxa de cobertura: ${taxa}%`;
    }

    if (!runs || runs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="cell-empty" style="padding: 2rem;">Nenhum lote de execução registrado ainda hoje. Inicie uma nova coleta para visualizar o histórico.</td></tr>`;
      return;
    }

    let html = '';
    runs.forEach(r => {
      const dataHora = r.created_at ? new Date(r.created_at).toLocaleString('pt-BR') : '—';
      const duracao = r.duracao_segundos ? `${r.duracao_segundos}s` : '—';
      const taxa = r.total_buscas > 0 ? ((r.total_encontrados / r.total_buscas) * 100).toFixed(0) : 0;

      html += `
        <tr>
          <td><strong>#${r.id}</strong></td>
          <td>${dataHora}</td>
          <td>Semana ${r.semana_coleta || 'Todas'}</td>
          <td>${r.total_buscas || 0}</td>
          <td style="color: var(--color-success); font-weight: 700;">${r.total_encontrados || 0} (${taxa}%)</td>
          <td style="color: #64748b;">${r.total_nao_encontrados || 0}</td>
          <td>${duracao}</td>
          <td><span class="status-badge badge-conferido">${r.status || 'CONCLUIDO'}</span></td>
          <td style="text-align: left; font-size: 0.8rem; color: #334155;">${escapeHtml(r.mensagem_resumo || '—')}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="cell-alert">Erro ao carregar execuções: ${err.message}</td></tr>`;
  }
}

async function testarNotificacaoNtfy() {
  const btn = document.getElementById('btnTestarNtfy');
  if (btn) btn.disabled = true;

  try {
    const res = await fetch('/api/notificar-ntfy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: 'Teste ntfy - Preço da Hora DIEESE',
        mensagem: '📱 Notificação de teste recebida com sucesso!\nCanal: ntfy.sh/pdh-auto2026\nHorário: ' + new Date().toLocaleTimeString('pt-BR'),
        tags: 'bell,white_check_mark'
      })
    });
    const json = await res.json();
    if (json.success) {
      alert('✓ Notificação de teste enviada com sucesso para ntfy.sh/pdh-auto2026!');
    } else {
      alert('Falha ao enviar notificação: ' + json.error);
    }
  } catch (err) {
    alert('Erro de rede: ' + err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ==================== 8. CALENDÁRIO DE COLETAS & ESCALA DIEESE ====================
let dadosCalendario = [];

async function carregarCalendario() {
  const tbody = document.getElementById('tbodyCalendario');
  if (!tbody) return;

  const semana = document.getElementById('filtroSemanaCal')?.value || '';
  const diaSemana = document.getElementById('filtroDiaSemanaCal')?.value || '';
  const status = document.getElementById('filtroStatusCal')?.value || '';
  const busca = document.getElementById('filtroBuscaCalendario')?.value.toLowerCase().trim() || '';

  try {
    tbody.innerHTML = `<tr><td colspan="14" class="loading-td">Carregando escala do calendário...</td></tr>`;

    let url = `/api/v2/calendario?`;
    if (semana) url += `semana=${encodeURIComponent(semana)}&`;
    if (diaSemana) url += `dia_semana=${encodeURIComponent(diaSemana)}&`;
    if (status) url += `status=${encodeURIComponent(status)}&`;

    const res = await fetch(url);
    const json = await res.json();
    if (!json.success) {
      tbody.innerHTML = `<tr><td colspan="14" class="cell-alert">Erro: ${json.error}</td></tr>`;
      return;
    }

    dadosCalendario = json.data;
    const { totais } = json;

    if (document.getElementById('calTotEstab')) document.getElementById('calTotEstab').textContent = totais.total_estabelecimentos;
    if (document.getElementById('calTotEsperado')) document.getElementById('calTotEsperado').textContent = Number(totais.total_esperado).toLocaleString('pt-BR');
    if (document.getElementById('calTotRegistrado')) document.getElementById('calTotRegistrado').textContent = Number(totais.total_registrado).toLocaleString('pt-BR');
    if (document.getElementById('calTotValidado')) document.getElementById('calTotValidado').textContent = Number(totais.total_validado).toLocaleString('pt-BR');
    if (document.getElementById('calTotRestante')) document.getElementById('calTotRestante').textContent = Number(totais.total_restante).toLocaleString('pt-BR');
    if (document.getElementById('calProgressoPct')) {
      const pct = totais.total_esperado > 0 ? ((totais.total_registrado / totais.total_esperado) * 100).toFixed(1) : 0;
      document.getElementById('calProgressoPct').textContent = `${pct}% da meta geral atingida`;
    }

    let lista = dadosCalendario;
    if (busca) {
      lista = lista.filter(r => 
        (r.nome_estabelecimento && r.nome_estabelecimento.toLowerCase().includes(busca)) ||
        (r.bairro && r.bairro.toLowerCase().includes(busca)) ||
        (r.codigo_estabelecimento && r.codigo_estabelecimento.toLowerCase().includes(busca)) ||
        (r.codigo_externo && r.codigo_externo.toLowerCase().includes(busca)) ||
        (r.pesquisador && r.pesquisador.toLowerCase().includes(busca)) ||
        (r.critica_validador && r.critica_validador.toLowerCase().includes(busca))
      );
    }

    if (lista.length === 0) {
      tbody.innerHTML = `<tr><td colspan="14" class="cell-empty" style="padding: 2rem;">Nenhum agendamento localizado para os filtros informados.</td></tr>`;
      return;
    }

    let html = '';
    lista.forEach(r => {
      const dataEfetiva = r.data_efetiva ? new Date(r.data_efetiva).toLocaleDateString('pt-BR') : '—';
      const pct = r.total_esperado > 0 ? Math.min(100, Math.round((r.qtd_registrada / r.total_esperado) * 100)) : 0;
      const isComplete = pct >= 100;
      const codExtHtml = r.codigo_externo ? `<span class="badge-tag">${escapeHtml(r.codigo_externo)}</span>` : '<span style="color:#94a3b8; font-size:0.75rem;">—</span>';

      let statusBadge = '<span class="status-badge badge-vazio">PENDENTE</span>';
      if (r.status_tempo_real === 'CONCLUIDO') statusBadge = '<span class="status-badge badge-conferido">CONCLUÍDO</span>';
      else if (r.status_tempo_real === 'EM_ANDAMENTO') statusBadge = '<span class="status-badge badge-coletado">EM ANDAMENTO</span>';

      html += `
        <tr>
          <td><strong style="color:var(--color-primary); font-family:'JetBrains Mono',monospace;">${escapeHtml(r.codigo_estabelecimento)}</strong></td>
          <td>${codExtHtml}</td>
          <td>
            <strong>${escapeHtml(r.nome_estabelecimento)}</strong>
          </td>
          <td><span style="color:#64748b;">${escapeHtml(r.bairro || '—')}</span></td>
          <td><span class="badge-tag">Semana ${r.semana}</span></td>
          <td>${escapeHtml(r.dia_semana || '—')}</td>
          <td><strong>${dataEfetiva}</strong></td>
          <td>${escapeHtml(r.pesquisador || '—')}</td>
          <td>${escapeHtml(r.critica_validador || '—')}</td>
          <td>
            <div class="cell-progress-container">
              <div class="cell-progress-text">
                <span>${r.qtd_registrada}/${r.total_esperado}</span>
                <span>${pct}%</span>
              </div>
              <div class="cell-progress-bg">
                <div class="cell-progress-bar ${isComplete ? 'complete' : ''}" style="width: ${pct}%;"></div>
              </div>
            </div>
          </td>
          <td style="text-align: center;">
            <span class="badge-diff-neg" style="font-size:0.8rem;">✓ ${r.qtd_validada_humano}</span>
          </td>
          <td style="text-align: center;">
            <span class="${r.qtd_restante > 0 ? 'badge-diff-pos' : 'badge-diff-neg'}" style="font-size:0.8rem;">
              ${r.qtd_restante}
            </span>
          </td>
          <td>${statusBadge}</td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="abrirModalEscala(${r.id_calendario}, '${escapeHtml(r.nome_estabelecimento)}', '${r.data_efetiva ? r.data_efetiva.split('T')[0] : ''}', '${escapeHtml(r.pesquisador || '')}', '${escapeHtml(r.critica_validador || '')}', '${r.status_tempo_real}')">
              Editar
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="14" class="cell-alert">Erro de rede: ${err.message}</td></tr>`;
  }
}

function abrirModalEscala(id, nome, data, pesq, crit, stat) {
  const modal = document.getElementById('modalEditarEscala');
  if (!modal) return;
  document.getElementById('escalaId').value = id;
  document.getElementById('escalaMercadoNome').value = nome;
  document.getElementById('escalaDataEfetiva').value = data || '';
  document.getElementById('escalaPesquisador').value = pesq || '';
  document.getElementById('escalaCritica').value = crit || '';
  document.getElementById('escalaStatus').value = stat || 'PENDENTE';
  modal.classList.remove('hidden');
}

async function salvarEscala(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('escalaId').value;
  const payload = {
    data_efetiva: document.getElementById('escalaDataEfetiva').value || null,
    pesquisador: document.getElementById('escalaPesquisador').value.trim() || null,
    critica_validador: document.getElementById('escalaCritica').value.trim() || null,
    status: document.getElementById('escalaStatus').value
  };

  try {
    const res = await fetch(`/api/v2/calendario/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      document.getElementById('modalEditarEscala')?.classList.add('hidden');
      await carregarCalendario();
    } else {
      alert('Falha ao salvar escala: ' + json.error);
    }
  } catch (err) {
    alert('Erro de conexão: ' + err.message);
  }
}

// ==================== 9. RESUMOS, TOTAIS E MÉDIAS DIEESE ====================
let modoMatriz40Ativo = false;
let dadosResumos = [];

async function carregarResumosMedias() {
  const tbody = document.getElementById('tbodyResumosMedias');
  if (!tbody) return;

  const categoria = document.getElementById('filtroCategoriaResumos')?.value || '';
  const busca = document.getElementById('filtroBuscaResumos')?.value.toLowerCase().trim() || '';
  const apenasAlertas = document.getElementById('filtroAlertasResumos')?.checked || false;

  try {
    tbody.innerHTML = `<tr><td colspan="11" class="loading-td">Carregando dados consolidados de médias...</td></tr>`;

    let url = `/api/v2/resumos-medias?matriz=${modoMatriz40Ativo}&`;
    if (categoria) url += `categoria=${encodeURIComponent(categoria)}&`;
    if (busca) url += `busca=${encodeURIComponent(busca)}&`;
    if (apenasAlertas) url += `apenas_alertas=true&`;

    const res = await fetch(url);
    const json = await res.json();
    if (!json.success) {
      tbody.innerHTML = `<tr><td colspan="11" class="cell-alert">Erro: ${json.error}</td></tr>`;
      return;
    }

    dadosResumos = json.data;

    if (modoMatriz40Ativo) {
      renderizarMatriz40Mercados(dadosResumos);
      return;
    }

    if (dadosResumos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="11" class="cell-empty" style="padding: 2rem;">Nenhum produto atende aos filtros de médias selecionados.</td></tr>`;
      return;
    }

    let html = '';
    dadosResumos.forEach(p => {
      const precoMedAnt = p.preco_medio_anterior ? `R$ ${Number(p.preco_medio_anterior).toFixed(2).replace('.', ',')}` : '—';
      const precoMedAtual = p.preco_medio_atual ? `R$ ${Number(p.preco_medio_atual).toFixed(2).replace('.', ',')}` : '—';
      const min = p.preco_minimo ? `R$ ${Number(p.preco_minimo).toFixed(2).replace('.', ',')}` : '—';
      const max = p.preco_maximo ? `R$ ${Number(p.preco_maximo).toFixed(2).replace('.', ',')}` : '—';

      let variacaoHtml = '<span style="color:#94a3b8;">—</span>';
      if (p.variacao_percentual !== null && p.variacao_percentual !== undefined) {
        const v = Number(p.variacao_percentual);
        if (p.alerta_outlier_50pct) {
          variacaoHtml = `<span class="badge-outlier-pulse">⚠️ +${v.toFixed(1)}%</span>`;
        } else if (v < 0) {
          variacaoHtml = `<span class="badge-diff-neg">${v.toFixed(1)}%</span>`;
        } else {
          variacaoHtml = `<span class="badge-diff-pos">+${v.toFixed(1)}%</span>`;
        }
      }

      html += `
        <tr>
          <td><span class="badge-tag">${escapeHtml(p.categoria)}</span></td>
          <td><code style="font-family:'JetBrains Mono',monospace;">${escapeHtml(p.codigo_dieese)}</code></td>
          <td><strong>${escapeHtml(p.descricao_item)}</strong></td>
          <td><span style="font-family:'JetBrains Mono',monospace; font-size:0.8rem; color:#64748b;">${escapeHtml(p.codigo_barras || '—')}</span></td>
          <td><span class="badge-tag">${escapeHtml(p.unidade_medida || 'UN')}</span></td>
          <td style="text-align: right; color: #64748b;">${precoMedAnt}</td>
          <td style="text-align: right; font-weight: 800; color: var(--text-main);">${precoMedAtual}</td>
          <td style="text-align: right;">${variacaoHtml}</td>
          <td style="text-align: right; color: var(--color-success); font-weight: 600;">${min}</td>
          <td style="text-align: right; color: #dc2626; font-weight: 600;">${max}</td>
          <td style="text-align: center;"><strong>${p.qtd_coletada}</strong></td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="11" class="cell-alert">Erro de rede: ${err.message}</td></tr>`;
  }
}

function alternarMatrizResumos() {
  modoMatriz40Ativo = !modoMatriz40Ativo;
  const btn = document.getElementById('btnAlternarMatrizResumos');
  const wTab = document.getElementById('wrapperTabelaResumos');
  const wMat = document.getElementById('wrapperMatrizResumos');

  if (modoMatriz40Ativo) {
    if (btn) btn.textContent = 'Alternar para Tabela de Médias';
    if (wTab) wTab.classList.add('hidden');
    if (wMat) wMat.classList.remove('hidden');
  } else {
    if (btn) btn.textContent = 'Alternar para Matriz 40 Mercados';
    if (wTab) wTab.classList.remove('hidden');
    if (wMat) wMat.classList.add('hidden');
  }
  carregarResumosMedias();
}

function renderizarMatriz40Mercados(itens) {
  const thead = document.getElementById('theadMatriz40');
  const tbody = document.getElementById('tbodyMatriz40');
  if (!thead || !tbody) return;

  let headHtml = `
    <tr>
      <th style="position: sticky; left: 0; background: #f8fafc; z-index: 10; min-width: 260px;">Produto / Especificação</th>
  `;
  for (let m = 1; m <= 40; m++) {
    headHtml += `<th style="text-align: center; min-width: 80px;">M${m}</th>`;
  }
  headHtml += `
      <th style="min-width: 100px; text-align: right;">Média Ant.</th>
      <th style="min-width: 100px; text-align: right;">Média Atual</th>
      <th style="min-width: 90px; text-align: right;">Var %</th>
      <th style="min-width: 80px; text-align: center;">Qtd</th>
    </tr>
  `;
  thead.innerHTML = headHtml;

  let bodyHtml = '';
  itens.forEach(item => {
    const mapa = item.precos_por_mercado || {};
    const precoMedAnt = item.preco_medio_anterior ? `R$ ${Number(item.preco_medio_anterior).toFixed(2).replace('.', ',')}` : '—';
    const precoMedAtual = item.preco_medio_atual ? `R$ ${Number(item.preco_medio_atual).toFixed(2).replace('.', ',')}` : '—';
    const varPct = item.variacao_percentual !== null ? `${Number(item.variacao_percentual) > 0 ? '+' : ''}${Number(item.variacao_percentual).toFixed(1)}%` : '—';

    bodyHtml += `
      <tr>
        <td style="position: sticky; left: 0; background: white; z-index: 5; box-shadow: 2px 0 4px rgba(0,0,0,0.04);">
          <div style="font-weight: 700; font-size: 0.85rem;">${escapeHtml(item.descricao_item)}</div>
          <div style="font-size: 0.72rem; color: #64748b;">${escapeHtml(item.codigo_dieese)} &bull; ${escapeHtml(item.codigo_barras || 'Granel')}</div>
        </td>
    `;

    for (let m = 1; m <= 40; m++) {
      const codM = `M${m}`;
      const preco = mapa[codM];
      if (preco !== undefined && preco !== null) {
        bodyHtml += `<td style="text-align: center; font-family:'JetBrains Mono',monospace; font-size: 0.82rem; font-weight:700; color:var(--text-main); background: #f0fdf4;">R$ ${Number(preco).toFixed(2).replace('.', ',')}</td>`;
      } else {
        bodyHtml += `<td style="text-align: center; color: #cbd5e1; font-size: 0.8rem;">x</td>`;
      }
    }

    bodyHtml += `
        <td style="text-align: right; color:#64748b; font-size: 0.82rem;">${precoMedAnt}</td>
        <td style="text-align: right; font-weight:800; font-size: 0.85rem;">${precoMedAtual}</td>
        <td style="text-align: right; font-size: 0.82rem;">${varPct}</td>
        <td style="text-align: center; font-weight:700;">${item.qtd_coletada}</td>
      </tr>
    `;
  });

  tbody.innerHTML = bodyHtml;
}

// ==================== 10. CONFIGURAÇÃO DA AUTOMAÇÃO ====================
async function carregarConfiguracao() {
  try {
    const res = await fetch('/api/v2/configuracao');
    const json = await res.json();
    if (!json.success) return;

    const c = json.data;
    if (document.getElementById('cfgCron')) document.getElementById('cfgCron').value = c.cron_agendamento || '0 12,18,19,21 * * *';
    if (document.getElementById('cfgHoraInicio')) document.getElementById('cfgHoraInicio').value = (c.hora_inicio_janela || '05:00:00').substring(0, 5);
    if (document.getElementById('cfgHoraFim')) document.getElementById('cfgHoraFim').value = (c.hora_fim_janela || '21:00:00').substring(0, 5);
    if (document.getElementById('cfgApenasHoje')) document.getElementById('cfgApenasHoje').checked = c.apenas_vendas_do_dia !== false;
    if (document.getElementById('cfgRaioKm')) document.getElementById('cfgRaioKm').value = parseFloat(c.raio_padrao_km) || 15;
    if (document.getElementById('cfgAlertaOutlier')) document.getElementById('cfgAlertaOutlier').value = parseFloat(c.percentual_alerta_outlier) || 50;
    if (document.getElementById('cfgIgnorarPromocao')) document.getElementById('cfgIgnorarPromocao').checked = c.ignorar_descontos_promocoes !== false;
    if (document.getElementById('cfgNtfyUrl')) document.getElementById('cfgNtfyUrl').value = c.ntfy_topico_url || 'https://ntfy.sh/pdh-auto2026';
  } catch (err) {
    console.error('Falha ao carregar configurações:', err);
  }
}

async function salvarConfiguracao() {
  const btn = document.getElementById('btnSalvarConfig');
  if (btn) btn.disabled = true;

  const payload = {
    cron_agendamento: document.getElementById('cfgCron').value.trim(),
    hora_inicio_janela: document.getElementById('cfgHoraInicio').value + ':00',
    hora_fim_janela: document.getElementById('cfgHoraFim').value + ':00',
    apenas_vendas_do_dia: document.getElementById('cfgApenasHoje').checked,
    raio_padrao_km: parseFloat(document.getElementById('cfgRaioKm').value) || 15,
    percentual_alerta_outlier: parseFloat(document.getElementById('cfgAlertaOutlier').value) || 50,
    ignorar_descontos_promocoes: document.getElementById('cfgIgnorarPromocao').checked,
    ntfy_topico_url: document.getElementById('cfgNtfyUrl').value.trim()
  };

  try {
    const res = await fetch('/api/v2/configuracao', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      alert('✓ Parâmetros de horários estratégicos e automação salvos com sucesso!');
    } else {
      alert('Erro ao salvar: ' + json.message);
    }
  } catch (err) {
    alert('Erro de conexão: ' + err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}

// Conectar Listeners das novas abas
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnRecarregarCalendario')?.addEventListener('click', carregarCalendario);
  document.getElementById('filtroSemanaCal')?.addEventListener('change', carregarCalendario);
  document.getElementById('filtroDiaSemanaCal')?.addEventListener('change', carregarCalendario);
  document.getElementById('filtroStatusCal')?.addEventListener('change', carregarCalendario);
  document.getElementById('filtroBuscaCalendario')?.addEventListener('input', carregarCalendario);
  document.getElementById('formEditarEscala')?.addEventListener('submit', salvarEscala);
  document.getElementById('btnFecharModalEscala')?.addEventListener('click', () => {
    document.getElementById('modalEditarEscala')?.classList.add('hidden');
  });
  document.getElementById('btnCancelarEscala')?.addEventListener('click', () => {
    document.getElementById('modalEditarEscala')?.classList.add('hidden');
  });

  document.getElementById('btnAlternarMatrizResumos')?.addEventListener('click', alternarMatrizResumos);
  document.getElementById('btnRecarregarResumos')?.addEventListener('click', carregarResumosMedias);
  document.getElementById('filtroCategoriaResumos')?.addEventListener('change', carregarResumosMedias);
  document.getElementById('filtroBuscaResumos')?.addEventListener('input', carregarResumosMedias);
  document.getElementById('filtroAlertasResumos')?.addEventListener('change', carregarResumosMedias);

  document.getElementById('btnSalvarConfig')?.addEventListener('click', salvarConfiguracao);
});

window.abrirModalEscala = abrirModalEscala;
window.salvarEscala = salvarEscala;
window.carregarCalendario = carregarCalendario;
window.carregarResumosMedias = carregarResumosMedias;
window.alternarMatrizResumos = alternarMatrizResumos;
window.carregarConfiguracao = carregarConfiguracao;
window.salvarConfiguracao = salvarConfiguracao;
window.carregarHistoricoExecucoes = carregarHistoricoExecucoes;
window.testarNotificacaoNtfy = testarNotificacaoNtfy;

