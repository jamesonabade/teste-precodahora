import { pool } from '../src/db.js';

async function testFlow() {
  console.log('🧪 Iniciando teste do ciclo completo Schema V2...');

  // 1. Simula robô inserindo em tb_coleta_automatizada
  const eRes = await pool.query('SELECT id_estabelecimento, nome FROM tb_estabelecimento LIMIT 1');
  const pRes = await pool.query('SELECT id_produto, descricao_item, codigo_dieese FROM tb_produto_dieese LIMIT 1');
  const est = eRes.rows[0];
  const prod = pRes.rows[0];

  const resColeta = await pool.query(`
    INSERT INTO tb_coleta_automatizada (
      id_estabelecimento, id_produto, data_hora_extracao, preco_extraido, data_emissao_nfe, 
      link_comprovante_nfe, status_validacao, alerta_outlier
    ) VALUES ($1, $2, NOW(), 5.49, NOW(), 'https://nfe.sefaz.ba.gov.br/cupom/123456', 'PENDENTE', false)
    RETURNING id_coleta;
  `, [est.id_estabelecimento, prod.id_produto]);

  const idColeta = resColeta.rows[0].id_coleta;
  console.log(`✅ 1. Robô extraiu preço para [${prod.descricao_item}] no [${est.nome}], id_coleta: ${idColeta}`);

  // 2. Consulta API de pendentes
  const pendentesRes = await fetch('https://precodahora.dmi89h.easypanel.host/api/v2/coletas-pendentes').then(r => r.json());
  console.log(`📋 2. Itens Pendentes na API Humana: ${pendentesRes.count}`);

  // 3. Validador Humano aprova o preço
  const resVal = await fetch('https://precodahora.dmi89h.easypanel.host/api/v2/validar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_coleta: idColeta,
      id_usuario_validador: 2,
      decisao: 'APROVADO',
      preco_final_validado: 5.49,
      observacoes: 'Cupom SEFAZ do dia verificado'
    })
  }).then(r => r.json());
  console.log('✍️ 3. Validação humana registrada:', resVal.message);

  // 4. Consulta a view oficial do DIEESE
  const resOficial = await fetch('https://precodahora.dmi89h.easypanel.host/api/v2/precos-oficiais').then(r => r.json());
  console.log(`📊 4. View Oficial DIEESE possui ${resOficial.count} preços consolidados.`);
  if (resOficial.count > 0) {
    console.log('Amostra de item oficial DIEESE:', resOficial.data[0]);
  }

  await pool.end();
}

testFlow().catch(console.error);
