import PrecoDaHoraClient from 'precodahora-ba';
import { pool } from './db.js';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Valida se o cupom fiscal foi emitido no dia de referência (hoje)
 * e estritamente dentro da janela definida em tb_configuracao_automacao (padrão: das 05:00 até 21:00).
 * SEFAZ armazena até 72h; notas de dias anteriores são rejeitadas para a coleta do dia.
 */
export function isCupomValidoDoDia(dataNfeString, dataReferencia = new Date(), config = null) {
  if (!dataNfeString) return false;
  const dataNfe = new Date(dataNfeString);
  if (isNaN(dataNfe.getTime())) return false;

  const options = { timeZone: 'America/Bahia', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
  const nfeParts = new Intl.DateTimeFormat('pt-BR', options).formatToParts(dataNfe);
  const refParts = new Intl.DateTimeFormat('pt-BR', options).formatToParts(dataReferencia);

  const getPart = (parts, type) => parts.find(p => p.type === type)?.value;

  const nfeDay = getPart(nfeParts, 'day');
  const nfeMonth = getPart(nfeParts, 'month');
  const nfeYear = getPart(nfeParts, 'year');
  const nfeHour = parseInt(getPart(nfeParts, 'hour'), 10);
  const nfeMinute = parseInt(getPart(nfeParts, 'minute'), 10);

  const refDay = getPart(refParts, 'day');
  const refMonth = getPart(refParts, 'month');
  const refYear = getPart(refParts, 'year');

  const apenasHoje = config ? config.apenas_vendas_do_dia !== false : true;
  if (apenasHoje && (nfeDay !== refDay || nfeMonth !== refMonth || nfeYear !== refYear)) {
    return false;
  }

  // Janela configurável (Padrão: 05:00 até 21:00)
  let horaInicio = 5;
  let horaFim = 21;
  if (config && config.hora_inicio_janela) {
    horaInicio = parseInt(String(config.hora_inicio_janela).split(':')[0], 10);
  }
  if (config && config.hora_fim_janela) {
    horaFim = parseInt(String(config.hora_fim_janela).split(':')[0], 10);
  }

  if (nfeHour < horaInicio) return false;
  if (nfeHour > horaFim || (nfeHour === horaFim && nfeMinute > 0)) return false;

  return true;
}

export class PrecoDaHoraCollector {
  constructor(options = {}) {
    this.options = {
      timeout: options.timeout || 25000,
      retries: options.retries || 3,
      retryDelayMs: options.retryDelayMs || 1000,
      baseUrl: options.baseUrl || 'https://precodahora.ba.gov.br/'
    };
    this.municipio = options.municipio || 'vitoria da conquista';
    this.raioKm = options.raioKm || 15;
    this.minDelayMs = options.minDelayMs || 2500;
    this.maxDelayMs = options.maxDelayMs || 4000;
    this.client = new PrecoDaHoraClient(this.options);
    this.config = null;
  }

  /**
   * Carrega os parâmetros ativos da tb_configuracao_automacao
   */
  async carregarConfiguracao() {
    try {
      const res = await pool.query(`
        SELECT * FROM tb_configuracao_automacao 
        WHERE ativo = TRUE 
        ORDER BY id_configuracao DESC 
        LIMIT 1
      `);
      if (res.rows.length > 0) {
        this.config = res.rows[0];
        if (this.config.raio_padrao_km) {
          this.raioKm = Number(this.config.raio_padrao_km);
        }
        if (this.config.timeout_requisicao_segundos) {
          this.options.timeout = Number(this.config.timeout_requisicao_segundos) * 1000;
        }
      }
    } catch (e) {
      console.warn('Aviso: Não foi possível carregar tb_configuracao_automacao, usando padrões:', e.message);
    }
    return this.config;
  }

  /**
   * Recria a instância do client para renovar cookies e token CSRF (resolve erro 401)
   */
  renovarCliente() {
    this.client = new PrecoDaHoraClient(this.options);
  }

  /**
   * Aguarda um intervalo com jitter aleatório para não disparar o rate-limiting da SEFAZ
   */
  async esperarIntervaloSeguro() {
    const delay = Math.floor(Math.random() * (this.maxDelayMs - this.minDelayMs + 1)) + this.minDelayMs;
    await sleep(delay);
  }

  /**
   * Valida se a nota fiscal foi emitida no dia de referência (hoje)
   * e estritamente dentro da janela permitida
   */
  validarCupomDoDia(dataNfeString, dataReferencia = new Date()) {
    return isCupomValidoDoDia(dataNfeString, dataReferencia, this.config);
  }

  /**
   * Extrai o preço sem promoção de acordo com a regra de negócio do DIEESE.
   * Regra: Coletar o valor em vermelho acima do preço em negrito (preço sem promoção / bruto).
   */
  extrairPrecoSemPromocao(ofertaProduto, regraCalculo = 'PADRAO') {
    const p = ofertaProduto;
    let precoBase = p.precoBruto ?? p.precoUnitario ?? p.precoLiquido;

    if (p.precoBruto && p.precoLiquido && Number(p.precoBruto) > Number(p.precoLiquido)) {
      precoBase = Number(p.precoBruto);
    } else {
      precoBase = Number(precoBase);
    }

    let precoFinal = precoBase;
    const unidade = String(p.unidade || '').toUpperCase().trim();

    if (regraCalculo === 'PAO_KG') {
      if (unidade === 'UN' || unidade === 'UND') {
        precoFinal = precoBase * 20; // Estimativa DIEESE: 20 pãezinhos por kg
      }
    } else if (regraCalculo === 'OVO_UNIDADE') {
      if (unidade === 'DZ' || unidade === 'DUZIA') {
        precoFinal = precoBase / 12;
      }
    }

    return {
      precoFinal: Number(precoFinal.toFixed(2)),
      precoBruto: p.precoBruto ? Number(p.precoBruto) : precoBase,
      precoLiquido: p.precoLiquido ? Number(p.precoLiquido) : precoBase,
      precoUnitario: p.precoUnitario ? Number(p.precoUnitario) : precoBase,
      desconto: (p.precoBruto && p.precoLiquido) ? Number((p.precoBruto - p.precoLiquido).toFixed(2)) : 0
    };
  }

  /**
   * Executa busca na SEFAZ pelo GTIN com retry automático e renovação de CSRF
   */
  async buscarPorGtinComRetry(gtin, maxTentativas = 3) {
    for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
      try {
        const resultado = await this.client.pesquisar({
          gtin: String(gtin).trim(),
          municipio: this.municipio,
          raio: this.raioKm,
          dias: 1, // apenas notas das últimas 24h
          ordenar: 'preco.asc'
        });

        if (resultado && resultado.resultado) {
          return resultado.resultado;
        }
        return [];
      } catch (err) {
        const isAuthError = err.message?.includes('401') || err.message?.includes('token') || err.message?.includes('csrf');
        const isTimeout = err.message?.includes('timeout') || err.message?.includes('ETIMEDOUT');

        console.warn(`[Coletor] Tentativa ${tentativa}/${maxTentativas} falhou para GTIN ${gtin}: ${err.message}`);

        if (isAuthError) {
          this.renovarCliente();
          await sleep(2000);
        } else if (isTimeout) {
          await sleep(3000 * tentativa);
        } else {
          await sleep(1500);
        }

        if (tentativa === maxTentativas) {
          console.error(`[Coletor] Falha definitiva para GTIN ${gtin} após ${maxTentativas} tentativas.`);
          return [];
        }
      }
    }

    return [];
  }

  /**
   * Executa busca na SEFAZ por termo textual com retry automático
   */
  async buscarPorTermoComRetry(termo, maxTentativas = 3) {
    for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
      try {
        const resultado = await this.client.pesquisar({
          termo: String(termo).trim(),
          municipio: this.municipio,
          raio: this.raioKm,
          dias: 1,
          ordenar: 'preco.asc'
        });

        if (resultado && resultado.resultado) {
          return resultado.resultado;
        }
        return [];
      } catch (err) {
        console.warn(`[Coletor] Tentativa ${tentativa}/${maxTentativas} falhou para termo "${termo}": ${err.message}`);
        this.renovarCliente();
        await sleep(2000 * tentativa);
        if (tentativa === maxTentativas) return [];
      }
    }

    return [];
  }

  /**
   * Salva a oferta coletada diretamente em tb_coleta_automatizada
   */
  async salvarPreco({ estabelecimentoId, produtoId, oferta, regraCalculo, mediaAnterior }) {
    const prod = oferta.produto;
    const est = oferta.estabelecimento;

    const precos = this.extrairPrecoSemPromocao(prod, regraCalculo);

    let alertaOutlier = false;
    let motivoAlerta = null;
    const pctOutlier = this.config ? Number(this.config.percentual_alerta_outlier || 50) : 50;

    if (mediaAnterior && mediaAnterior > 0) {
      const limiteSuperior = mediaAnterior * (1 + (pctOutlier / 100));
      const limiteInferior = mediaAnterior * (1 - (pctOutlier / 100));
      if (precos.precoFinal > limiteSuperior || precos.precoFinal < limiteInferior) {
        alertaOutlier = true;
        motivoAlerta = `Preço R$ ${precos.precoFinal.toFixed(2)} varia mais de ${pctOutlier}% da média anterior (R$ ${Number(mediaAnterior).toFixed(2)})`;
      }
    }

    const cnpjLimpo = est.cnpj ? String(est.cnpj).replace(/\D/g, '') : null;
    const latLong = (est.latitude && est.longitude) ? `${est.latitude},${est.longitude}` : null;

    // Atualiza cadastro do estabelecimento com CNPJ e coordenadas frescas
    if (estabelecimentoId && cnpjLimpo) {
      try {
        await pool.query(`
          UPDATE tb_estabelecimento
          SET cnpj = COALESCE(cnpj, $1),
              lat_long = COALESCE(lat_long, $2),
              updated_at = NOW()
          WHERE id_estabelecimento = $3
        `, [cnpjLimpo, latLong, estabelecimentoId]);
      } catch (e) {}
    }

    // Grava diretamente na nova tabela oficial tb_coleta_automatizada
    const res = await pool.query(`
      INSERT INTO tb_coleta_automatizada (
        id_estabelecimento, id_produto, data_hora_extracao, preco_extraido, data_emissao_nfe,
        link_comprovante_nfe, status_validacao, alerta_outlier, motivo_alerta, raw_payload
      ) VALUES (
        $1, $2, NOW(), $3, $4, $5, 'PENDENTE', $6, $7, $8
      )
      RETURNING id_coleta;
    `, [
      estabelecimentoId,
      produtoId,
      precos.precoFinal,
      prod.data ? new Date(prod.data) : null,
      prod.linkNfe || null,
      alertaOutlier,
      motivoAlerta,
      JSON.stringify(oferta)
    ]);

    return res.rows[0].id_coleta;
  }

  /**
   * Correspondência estrita entre uma oferta da SEFAZ e os estabelecimentos cadastrados.
   * Evita falsos positivos entre filiais de bairros diferentes da mesma rede.
   */
  matchEstabelecimento(oferta, estabelecimentos) {
    const estOferta = oferta.estabelecimento;
    const cnpjOferta = estOferta?.cnpj ? String(estOferta.cnpj).replace(/\D/g, '') : '';
    const nomeOferta = String(estOferta?.nomeEstabelecimento || '').toUpperCase();
    const bairroOferta = String(estOferta?.bairro || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 1. Prioridade máxima: CNPJ exato
    if (cnpjOferta) {
      const matchCnpj = estabelecimentos.find(e => e.cnpj && String(e.cnpj).replace(/\D/g, '') === cnpjOferta);
      if (matchCnpj) return matchCnpj;
    }

    // 2. Correspondência por nome e bairro normalizados
    return estabelecimentos.find(e => {
      const nomeCadastrado = String(e.nome || '').toUpperCase();
      const bairroCadastrado = String(e.bairro || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      const nomeBate = nomeOferta.includes(nomeCadastrado) || nomeCadastrado.includes(nomeOferta);
      const bairroBate = bairroOferta && bairroCadastrado && (
        bairroOferta.includes(bairroCadastrado) || bairroCadastrado.includes(bairroOferta)
      );

      return nomeBate && bairroBate;
    });
  }
}
