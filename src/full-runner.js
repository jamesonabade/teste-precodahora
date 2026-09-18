import { pool } from './db.js';
import { PrecoDaHoraCollector } from './collector.js';

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function runFullCollection() {
  console.log('🚀 Iniciando pipeline completo de coleta DIEESE no Preço da Hora Bahia...');

  const collector = new PrecoDaHoraCollector({
    municipio: 'vitoria da conquista',
    raioKm: 15,
    timeout: 25000,
    retries: 3
  });

  try {
    // 1. Obter o lote ativo
    const loteRes = await pool.query(`
      SELECT id, mes_ano_referencia FROM coletas_lote 
      WHERE status = 'EM_ANDAMENTO' 
      ORDER BY id DESC LIMIT 1
    `);
    
    if (loteRes.rows.length === 0) {
      throw new Error('Nenhum lote de coleta ativo encontrado.');
    }
    const lote = loteRes.rows[0];
    console.log(`📦 Lote selecionado: ID ${lote.id} (${lote.mes_ano_referencia})`);

    // 2. Carregar todos os 40 estabelecimentos
    const estabsRes = await pool.query(`
      SELECT id, codigo_planilha, nome, bairro, cnpj 
      FROM estabelecimentos 
      WHERE ativo = TRUE 
      ORDER BY id ASC
    `);
    const estabelecimentos = estabsRes.rows;
    console.log(`🏬 ${estabelecimentos.length} estabelecimentos carregados.`);

    // 3. Carregar todos os produtos catalogados
    const prodsRes = await pool.query(`
      SELECT id, codigo_produto, categoria, item_cesta, marca_especificacao, gtin, tipo_busca, termo_busca, regra_calculo
      FROM produtos_catalogo
      WHERE ativo = TRUE
      ORDER BY id ASC
    `);
    const produtos = prodsRes.rows;
    console.log(`🛒 ${produtos.length} produtos catalogados.`);

    let totalColetados = 0;
    let contadorConsultas = 0;

    for (const prod of produtos) {
      contadorConsultas++;
      console.log(`\n[${contadorConsultas}/${produtos.length}] Consultando: ${prod.marca_especificacao} (${prod.gtin || prod.termo_busca})...`);

      let ofertas = [];
      try {
        if (prod.tipo_busca === 'GTIN' && prod.gtin) {
          ofertas = await collector.consultarProduto({ gtin: prod.gtin, ordenar: 'preco.asc' });
        } else {
          ofertas = await collector.consultarProduto({ termo: prod.termo_busca, ordenar: 'preco.asc' });
        }
      } catch (err) {
        console.warn(`   ⚠️ Erro ao consultar produto ${prod.marca_especificacao}: ${err.message}`);
        await sleep(1000);
        continue;
      }

      console.log(`   ↳ ${ofertas.length} ofertas retornadas pela API.`);

      for (const oferta of ofertas) {
        const estOferta = oferta.estabelecimento;
        const cnpjOferta = estOferta?.cnpj ? String(estOferta.cnpj).replace(/\D/g, '') : '';
        const nomeOferta = String(estOferta?.nomeEstabelecimento || '').toUpperCase();
        const bairroOferta = String(estOferta?.bairro || '').toUpperCase();

        const matchedEstab = estabelecimentos.find(e => {
          if (e.cnpj && cnpjOferta) {
            return String(e.cnpj).replace(/\D/g, '') === cnpjOferta;
          }
          const nomeCad = e.nome.toUpperCase();
          return nomeOferta.includes(nomeCad) || nomeCad.includes(nomeOferta);
        });

        if (matchedEstab) {
          await collector.salvarPreco({
            coletaId: lote.id,
            estabelecimentoId: matchedEstab.id,
            produtoId: prod.id,
            oferta,
            regraCalculo: prod.regra_calculo
          });
          totalColetados++;
          console.log(`   🎯 Preço registrado para ${matchedEstab.codigo_planilha} (${matchedEstab.nome}): R$ ${oferta.produto.precoBruto ?? oferta.produto.precoUnitario}`);
        }
      }

      // Pequeno intervalo entre requisições para respeitar a SEFAZ
      await sleep(400);
    }

    console.log(`\n🎉 Coleta concluída com sucesso! Total de preços registrados: ${totalColetados}`);

  } catch (error) {
    console.error('❌ Erro na coleta completa:', error);
  } finally {
    await pool.end();
  }
}

// Se executado diretamente via terminal
if (process.argv[1]?.endsWith('full-runner.js')) {
  runFullCollection();
}
