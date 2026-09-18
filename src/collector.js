import PrecoDaHoraClient from 'precodahora-ba';
import { pool } from './db.js';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Valida se o cupom fiscal foi emitido no dia de referência (hoje)
 * e estritamente dentro da janela: das 05:00 da manhã até as 21:00 da noite.
 * SEFAZ armazena até 72h; notas de dias anteriores são rejeitadas para a coleta do dia.
 */
export function isCupomValidoDoDia(dataNfeString, dataReferencia = new Date()) {
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

  if (nfeDay !== refDay || nfeMonth !== refMonth || nfeYear !== refYear) {
    return false;
  }

  // Janela: das 05:00 até 21:00 (inclusive)
  if (nfeHour < 5) return false;
  if (nfeHour > 21 || (nfeHour === 21 && nfeMinute > 0)) return false;

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
   * e estritamente dentro da janela: das 05:00 da manhã até as 21:00 da noite.
   */
  validarCupomDoDia(dataNfeString, dataReferencia = new Date()) {
    return isCupomValidoDoDia(dataNfeString, dataReferencia);
  }

  /**
   * Extrai o preço sem promoção de acordo com a regra de negócio do DIEESE.
   * Regra: Coletar o valor em vermelho acima do preço em negrito (preço sem promoção).
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
        precoFinal = precoBase * 20;
      }
    } else if (regraCalculo === 'OVO_UNIDADE') {
      const desc = String(p.descricao || '').toUpperCase();
      if (desc.includes('30') || desc.includes('C/30') || desc.includes('30UN')) {
        precoFinal = precoBase / 30;
      } else if (desc.includes('12') || desc.includes('DZ') || desc.includes('DUZIA') || desc.includes('C/12')) {
        precoFinal = precoBase / 12;
      } else if (desc.includes('20') || desc.includes('C/20')) {
        precoFinal = precoBase / 20;
      }
    }

    return {
      precoFinal: Number(precoFinal.toFixed(4)),
      precoBruto: p.precoBruto ? Number(p.precoBruto) : null,
      precoLiquido: p.precoLiquido ? Number(p.precoLiquido) : null,
      precoUnitario: p.precoUnitario ? Number(p.precoUnitario) : null,
      desconto: p.desconto ? Number(p.desconto) : null,
      unidadeOriginal: p.unidade
    };
  }

  /**
   * Consulta produto com tratamento robusto anti-429 e anti-401
   */
  async consultarProduto({ gtin, termo, ordenar = 'preco.asc' }) {
    const params = {
      municipio: this.municipio,
      raio: this.raioKm,
      ordenar
    };

    if (gtin) {
      params.gtin = Number(gtin);
    } else if (termo) {
      params.termo = termo;
    } else {
      throw new Error('GTIN ou termo de busca deve ser fornecido');
    }

    let tentativas = 0;
    const maxTentativasLocais = 3;

    while (tentativas < maxTentativasLocais) {
      try {
        await this.esperarIntervaloSeguro();
        const resposta = await this.client.produto(params);
        return resposta.resultado || [];
      } catch (err) {
        tentativas++;
        const status = err.response?.status;
        const msg = err.message || '';

        if (status === 429 || msg.includes('429')) {
          const pausaMs = 12000 * tentativas;
          console.warn(`   ⚠️ [429 - Rate Limit] Servidor solicitou pausa. Aguardando ${(pausaMs/1000).toFixed(0)}s antes de tentar novamente...`);
          await sleep(pausaMs);
          this.renovarCliente();
        } else if (status === 401 || msg.includes('401')) {
          console.warn(`   ⚠️ [401 - Sessão Expirada] Renovando cliente e sessão SEFAZ...`);
          this.renovarCliente();
          await sleep(3000);
        } else {
          if (tentativas >= maxTentativasLocais) {
            throw err;
          }
          await sleep(3000);
        }
      }
    }

    return [];
  }

  /**
   * Salva a oferta coletada no PostgreSQL com regra de UPSERT e cálculo de outlier
   */
  async salvarPreco({ coletaId, estabelecimentoId, produtoId, oferta, regraCalculo }) {
    const prod = oferta.produto;
    const est = oferta.estabelecimento;

    const precos = this.extrairPrecoSemPromocao(prod, regraCalculo);

    // Buscar média histórica do mês anterior para verificar outlier (>50%)
    let mediaAnterior = null;
    try {
      const histRes = await pool.query(
        'SELECT preco_medio FROM historico_medias WHERE produto_id = $1 ORDER BY id DESC LIMIT 1',
        [produtoId]
      );
      if (histRes.rows.length > 0) {
        mediaAnterior = Number(histRes.rows[0].preco_medio);
      }
    } catch (e) {
      // silencioso
    }

    let alertaOutlier = false;
    let motivoAlerta = null;

    if (mediaAnterior && mediaAnterior > 0) {
      const limite = mediaAnterior * 1.5;
      if (precos.precoFinal > limite) {
        alertaOutlier = true;
        motivoAlerta = `Preço R$ ${precos.precoFinal.toFixed(2)} excede em 50% a média anterior (R$ ${mediaAnterior.toFixed(2)})`;
      }
    }

    const enderecoFormatado = `${est.endLogradouro || ''} ${est.endNumero || ''}, ${est.bairro || ''} - ${est.municipio || ''}`.trim();
    const cnpjLimpo = est.cnpj ? String(est.cnpj).replace(/\D/g, '') : null;

    // UPSERT: Atualiza se já existir para a mesma coleta, mercado e produto
    const querySql = `
      INSERT INTO precos_coletados (
        coleta_id, estabelecimento_id, produto_id,
        gtin_consultado, gtin_encontrado, descricao_nfe,
        preco_unitario_nfe, preco_liquido_nfe, preco_bruto_nfe, desconto_nfe,
        preco_final_coletado, unidade_medida_nfe,
        data_emissao_nfe, intervalo_tempo,
        cnpj_estabelecimento, nome_estabelecimento_nfe, endereco_estabelecimento_nfe, distancia_km,
        alerta_outlier, motivo_alerta, raw_payload
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )
      ON CONFLICT (coleta_id, estabelecimento_id, produto_id) 
      DO UPDATE SET
        preco_unitario_nfe = EXCLUDED.preco_unitario_nfe,
        preco_liquido_nfe = EXCLUDED.preco_liquido_nfe,
        preco_bruto_nfe = EXCLUDED.preco_bruto_nfe,
        desconto_nfe = EXCLUDED.desconto_nfe,
        preco_final_coletado = EXCLUDED.preco_final_coletado,
        unidade_medida_nfe = EXCLUDED.unidade_medida_nfe,
        data_emissao_nfe = EXCLUDED.data_emissao_nfe,
        intervalo_tempo = EXCLUDED.intervalo_tempo,
        alerta_outlier = EXCLUDED.alerta_outlier,
        motivo_alerta = EXCLUDED.motivo_alerta,
        raw_payload = EXCLUDED.raw_payload,
        data_coleta = NOW()
      RETURNING id;
    `;

    const res = await pool.query(querySql, [
      coletaId,
      estabelecimentoId,
      produtoId,
      String(prod.gtin || ''),
      String(prod.codProduto || prod.gtin || ''),
      prod.descricao,
      precos.precoUnitario,
      precos.precoLiquido,
      precos.precoBruto,
      precos.desconto,
      precos.precoFinal,
      prod.unidade,
      prod.data ? new Date(prod.data) : null,
      prod.intervalo,
      cnpjLimpo,
      est.nomeEstabelecimento,
      enderecoFormatado,
      est.distancia ? Number(est.distancia) : null,
      alertaOutlier,
      motivoAlerta,
      JSON.stringify(oferta)
    ]);

    // Enriquecimento do estabelecimento
    if (estabelecimentoId && cnpjLimpo) {
      await pool.query(`
        UPDATE estabelecimentos
        SET cnpj = COALESCE(cnpj, $1),
            latitude = COALESCE(latitude, $2),
            longitude = COALESCE(longitude, $3),
            updated_at = NOW()
        WHERE id = $4
      `, [cnpjLimpo, est.latitude, est.longitude, estabelecimentoId]);

      // Atualiza também tb_estabelecimento
      try {
        await pool.query(`
          UPDATE tb_estabelecimento
          SET cnpj = COALESCE(cnpj, $1),
              lat_long = COALESCE(lat_long, $2),
              updated_at = NOW()
          WHERE codigo_externo = (SELECT codigo_planilha FROM estabelecimentos WHERE id = $3)
        `, [cnpjLimpo, `${est.latitude},${est.longitude}`, estabelecimentoId]);
      } catch (e) {}
    }

    // Sincronização com a nova tabela tb_coleta_automatizada (V2)
    try {
      await pool.query(`
        INSERT INTO tb_coleta_automatizada (
          id_estabelecimento, id_produto, data_hora_extracao, preco_extraido, data_emissao_nfe,
          link_comprovante_nfe, status_validacao, alerta_outlier, motivo_alerta, raw_payload
        )
        SELECT 
          te.id_estabelecimento,
          tp.id_produto,
          NOW(),
          $1,
          $2,
          NULL,
          'PENDENTE',
          $3,
          $4,
          $5
        FROM estabelecimentos e
        JOIN tb_estabelecimento te ON te.codigo_externo = e.codigo_planilha
        JOIN produtos_catalogo p ON p.id = $7
        JOIN tb_produto_dieese tp ON tp.codigo_dieese = p.codigo_produto
        WHERE e.id = $6
      `, [
        precos.precoFinal,
        prod.data ? new Date(prod.data) : null,
        alertaOutlier,
        motivoAlerta,
        JSON.stringify(oferta),
        estabelecimentoId,
        produtoId
      ]);
    } catch (syncV2Err) {
      // Ignora se a tabela ainda não tiver sido inicializada
    }

    return res.rows[0].id;
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

    // 2. Correspondência textual estrita: Nome compatível E Bairro compatível
    return estabelecimentos.find(e => {
      const nomeCad = String(e.nome || '').toUpperCase();
      const bairroCad = String(e.bairro || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      const matchNome = (
        nomeOferta.includes(nomeCad) || 
        nomeCad.includes(nomeOferta) ||
        (nomeCad.includes('BH') && nomeOferta.includes('SUPERMERCADOS BH')) ||
        (nomeCad.includes('MATEUS') && nomeOferta.includes('MATEUS')) ||
        (nomeCad.includes('ECONOMART') && nomeOferta.includes('ECONOMART')) ||
        (nomeCad.includes('ATAKAREJO') && nomeOferta.includes('ATAKAREJO')) ||
        (nomeCad.includes('SÃO JORGE') && nomeOferta.includes('SÃO JORGE'))
      );

      if (!matchNome) return false;

      // EXIGÊNCIA ESTRITA: Se o bairro estiver cadastrado, a nota fiscal TEM que ser do mesmo bairro
      if (bairroCad && bairroOferta) {
        const matchBairro = bairroOferta.includes(bairroCad) || bairroCad.includes(bairroOferta);
        return matchBairro;
      }

      return false; // Sem confirmação de bairro ou CNPJ, descarta para evitar incoerência
    });
  }
}
