import { pool } from './db.js';

// Mapeamento preciso dos 40 mercados com seus endereços e bairros reais em Vitória da Conquista
const ENDERECOS_MERCADOS = {
  'M1': { nome: 'Atakarejo', bairro: 'Candeias', endereco: 'Av. Olívia Flores, s/n - Candeias, Vitória da Conquista - BA', cnpj: '03915392000107' },
  'M2': { nome: 'Supermercado São Jorge', bairro: 'Henriqueta Prates', endereco: 'Bairro Henriqueta Prates, Vitória da Conquista - BA' },
  'M3': { nome: 'Economart', bairro: 'Bateias', endereco: 'Av. Brumado, 1200 - Bateias, Vitória da Conquista - BA', cnpj: '28548486001430' },
  'M4': { nome: 'Mercadinho Deus Dará', bairro: 'Alto Maron', endereco: 'Bairro Alto Maron, Vitória da Conquista - BA' },
  'M5': { nome: 'Mix Mateus', bairro: 'Boa Vista', endereco: 'Av. Juracy Magalhães, s/n - Boa Vista, Vitória da Conquista - BA', cnpj: '03995515024422' },
  'M6': { nome: 'Mercado Eliene', bairro: 'Ibirapuera', endereco: 'Bairro Ibirapuera, Vitória da Conquista - BA' },
  'M7': { nome: 'Santo Antônio Supermercados', bairro: 'Candeias', endereco: 'Av. Olívia Flores, Candeias, Vitória da Conquista - BA' },
  'M8': { nome: 'Mercado Teixeira', bairro: 'Brasil', endereco: 'Bairro Brasil, Vitória da Conquista - BA' },
  'M9': { nome: 'Supermercado Modelo', bairro: 'Alto Maron', endereco: 'Rua Presidente Vargas, Alto Maron, Vitória da Conquista - BA' },
  'M10': { nome: 'Supermercado Esplendor', bairro: 'Boa Vista', endereco: 'Rua Guimarães Rosa 290, Boa Vista, Vitória da Conquista - BA', cnpj: '17863208000137' },
  'M11': { nome: 'Sendas Distribuidora (Assaí Atacadista)', bairro: 'Felícia', endereco: 'Av. Juracy Magalhães, Felícia, Vitória da Conquista - BA', cnpj: '06057223030380' },
  'M12': { nome: 'Supermercado Sampaio', bairro: 'Guarani', endereco: 'Bairro Guarani, Vitória da Conquista - BA' },
  'M13': { nome: 'Atacadão (Brumado)', bairro: 'Bateias', endereco: 'Av. Brumado, Bateias, Vitória da Conquista - BA' },
  'M14': { nome: 'Supermercado Central Ipanema', bairro: 'Boa Vista', endereco: 'Boa Vista, Vitória da Conquista - BA' },
  'M15': { nome: 'Supermercados BH (Juracy)', bairro: 'Boa Vista', endereco: 'Av. Juracy Magalhães, Boa Vista, Vitória da Conquista - BA' },
  'M16': { nome: 'Supermercado Canaã', bairro: 'Campinhos', endereco: 'Campinhos, Vitória da Conquista - BA' },
  'M17': { nome: 'Supermercado Aliança', bairro: 'Patagônia', endereco: 'Bairro Patagônia, Vitória da Conquista - BA' },
  'M18': { nome: 'Pereira Atacado e Varejo (Boa Vista)', bairro: 'Boa Vista', endereco: 'Av. Juracy Magalhães, Boa Vista, Vitória da Conquista - BA' },
  'M19': { nome: 'Andralmeida LTDA (São Geraldo)', bairro: 'Alto Maron', endereco: 'Av. Presidente Vargas 258, Alto Maron, Vitória da Conquista - BA', cnpj: '00196901000109' },
  'M20': { nome: 'São Miguel Supermercado', bairro: 'Espírito Santo', endereco: 'Espírito Santo, Vitória da Conquista - BA' },
  'M21': { nome: 'Supermercados BH (Rosa Cruz)', bairro: 'Candeias', endereco: 'Av. Rosa Cruz, 80 - Candeias, Vitória da Conquista - BA', cnpj: '04641376047795' },
  'M22': { nome: 'Supermercados N U (Bairro Brasil)', bairro: 'Brasil', endereco: 'Bairro Brasil, Vitória da Conquista - BA' },
  'M23': { nome: 'Atacadão (Pres. Dutra)', bairro: 'Felícia', endereco: 'Rod. Pres. Dutra, Felícia, Vitória da Conquista - BA' },
  'M24': { nome: 'Supermercado São João', bairro: 'Guarani', endereco: 'Bairro Guarani, Vitória da Conquista - BA' },
  'M25': { nome: 'G Barbosa Supermercado', bairro: 'Candeias', endereco: 'Av. Olívia Flores, Candeias, Vitória da Conquista - BA' },
  'M26': { nome: 'Pereira Atacado e Varejo (Alto Maron)', bairro: 'Alto Maron', endereco: 'Alto Maron, Vitória da Conquista - BA' },
  'M27': { nome: 'Supermercados BH (Brumado)', bairro: 'Ibirapuera', endereco: 'Av. Brumado, Ibirapuera, Vitória da Conquista - BA' },
  'M28': { nome: 'Super Mix Supermercado', bairro: 'Boa Vista', endereco: 'Boa Vista, Vitória da Conquista - BA' },
  'M29': { nome: 'Gbom Supermercado', bairro: 'Ibirapuera', endereco: 'Ibirapuera, Vitória da Conquista - BA' },
  'M30': { nome: 'Supermercado Azevedo', bairro: 'Urbis VI', endereco: 'Urbis VI, Vitória da Conquista - BA' },
  'M31': { nome: 'Supermercado Jurema', bairro: 'Jurema', endereco: 'Rua Panamá 49, Jurema, Vitória da Conquista - BA', cnpj: '35229626000159' },
  'M32': { nome: 'Supermercado Petybom', bairro: 'Primavera', endereco: 'Primavera, Vitória da Conquista - BA' },
  'M33': { nome: 'Supermercados Petrópolis', bairro: 'Cruzeiro', endereco: 'Cruzeiro, Vitória da Conquista - BA' },
  'M34': { nome: 'Supermercados N U (Boulevard)', bairro: 'Candeias', endereco: 'Boulevard Shopping, Candeias, Vitória da Conquista - BA' },
  'M35': { nome: 'Supermercado Local', bairro: 'Vila Serrana', endereco: 'Via Local N VL Serrana I 02, Zabelê, Vitória da Conquista - BA', cnpj: '03065441000160' },
  'M36': { nome: 'Rondelli Comércio', bairro: 'Candeias', endereco: 'Candeias, Vitória da Conquista - BA' },
  'M37': { nome: 'NS Aparecida', bairro: 'Brasil', endereco: 'Bairro Brasil, Vitória da Conquista - BA' },
  'M38': { nome: 'Supermercado Família', bairro: 'Felícia', endereco: 'Felícia, Vitória da Conquista - BA' },
  'M39': { nome: 'S Nossa Senhora', bairro: 'Urbis V', endereco: 'Urbis V, Vitória da Conquista - BA' },
  'M40': { nome: 'Supermercado Nova Economia', bairro: 'Centro', endereco: 'Av. Régis Pacheco 246, Centro, Vitória da Conquista - BA', cnpj: '06040979000108' }
};

async function fixAddressesAndMatching() {
  const client = await pool.connect();
  try {
    console.log('🏬 Atualizando endereços completos e bairros oficiais dos 40 mercados...');
    await client.query('BEGIN');

    for (const [codigo, d] of Object.entries(ENDERECOS_MERCADOS)) {
      await client.query(`
        UPDATE estabelecimentos
        SET endereco_completo = $1,
            cnpj = COALESCE($2, cnpj)
        WHERE codigo_planilha = $3
      `, [d.endereco, d.cnpj || null, codigo]);
    }
    console.log('✅ Endereços atualizados!');

    // Corrigir associação incoerente do CNPJ do Supermercados BH Rosa Cruz (M21)
    // O CNPJ 04641376047795 pertence ao M21 (Candeias), não ao M15 (Boa Vista)
    const m21Res = await client.query("SELECT id FROM estabelecimentos WHERE codigo_planilha = 'M21'");
    if (m21Res.rows.length > 0) {
      const m21Id = m21Res.rows[0].id;
      const fixRes = await client.query(`
        UPDATE precos_coletados
        SET estabelecimento_id = $1
        WHERE cnpj_estabelecimento = '04641376047795' AND estabelecimento_id != $1
      `, [m21Id]);
      console.log(`✅ ${fixRes.rowCount} registros re-associados com sucesso ao M21 (Supermercados BH Rosa Cruz)!`);
    }

    await client.query('COMMIT');
    console.log('🎉 Saneamento de endereços e matching concluído!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro no saneamento:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAddressesAndMatching();
