import { pool } from './db.js';

// Mapeamento correto de códigos para Categoria e Item da Cesta Básica DIEESE
const MAPA_DIEESE = {
  '1.1.01.01': { categoria: 'Leite e Derivados 1.1.01', item: 'Leite Pasteurizado (1 lt)' },
  '1.1.01.02': { categoria: 'Leite e Derivados 1.1.01', item: 'Queijo Mussarela (150g)' },
  '1.1.01.03': { categoria: 'Leite e Derivados 1.1.01', item: 'Queijo Prato (150g)' },
  '1.1.01.04': { categoria: 'Leite e Derivados 1.1.01', item: 'Manteiga (500g)' },
  '1.1.02.01': { categoria: 'Farinhas e Massas 1.1.02', item: 'Farinha de Mandioca (1Kg)' },
  '1.1.02.02': { categoria: 'Farinhas e Massas 1.1.02', item: 'Farinha de Milho (500g)' },
  '1.1.02.03': { categoria: 'Farinhas e Massas 1.1.02', item: 'Macarrão Espaguete (500g)' },
  '1.1.03.01': { categoria: 'Café 1.1.03', item: 'Café (250g)' },
  '1.1.04.01': { categoria: 'Pão Francês 1.1.04', item: 'Pão Francês (1 kg)' },
  '1.1.05.01': { categoria: 'Açúcar 1.1.05', item: 'Açúcar Cristal (1Kg)' },
  '1.1.06.01': { categoria: 'Óleo 1.1.06', item: 'Óleo de Soja (900 ml)' },
  '1.2.01.01': { categoria: 'Carnes, Ovos e Embutidos 1.2.01', item: 'Carne Acém (1 kg)' },
  '1.2.01.02': { categoria: 'Carnes, Ovos e Embutidos 1.2.01', item: 'Carne Alcatra (1 kg)' },
  '1.2.01.03': { categoria: 'Carnes, Ovos e Embutidos 1.2.01', item: 'Charque (1Kg)' },
  '1.2.01.04': { categoria: 'Carnes, Ovos e Embutidos 1.2.01', item: 'Frango Inteiro Congelado (1 kg)' },
  '1.2.01.05': { categoria: 'Carnes, Ovos e Embutidos 1.2.01', item: 'Linguiça Calabresa (400g)' },
  '1.2.01.06': { categoria: 'Carnes, Ovos e Embutidos 1.2.01', item: 'Ovos Brancos (Unid.)' },
  '1.2.02.01': { categoria: 'Feijão 1.2.02', item: 'Feijão Carioca (1 kg)' },
  '1.2.03.01': { categoria: 'Arroz 1.2.03', item: 'Arroz Parboilizado (1Kg)' },
  '1.3.01.01': { categoria: 'Tubérculos, Raízes e Legumes 1.3.01', item: 'Batata Inglesa (1 kg)' },
  '1.3.01.02': { categoria: 'Tubérculos, Raízes e Legumes 1.3.01', item: 'Tomate (1 kg)' },
  '1.3.01.03': { categoria: 'Tubérculos, Raízes e Legumes 1.3.01', item: 'Cenoura (1 kg)' },
  '1.3.01.04': { categoria: 'Tubérculos, Raízes e Legumes 1.3.01', item: 'Cebola (1 kg)' },
  '1.3.02.01': { categoria: 'Frutas 1.3.02', item: 'Banana Prata (1 kg)' },
  '1.3.02.02': { categoria: 'Frutas 1.3.02', item: 'Laranja (1 kg)' }
};

async function fixCategories() {
  const client = await pool.connect();
  try {
    console.log('🔧 Iniciando saneamento e correção das categorias e itens...');
    await client.query('BEGIN');

    let totalAtualizados = 0;
    for (const [codigo, dados] of Object.entries(MAPA_DIEESE)) {
      const res = await client.query(`
        UPDATE produtos_catalogo
        SET categoria = $1,
            item_cesta = $2
        WHERE codigo_produto = $3
      `, [dados.categoria, dados.item, codigo]);
      totalAtualizados += res.rowCount;
    }

    await client.query('COMMIT');
    console.log(`✅ ${totalAtualizados} produtos corrigidos com sucesso!`);

    // Exibir amostra dos dados normalizados
    const check = await client.query(`
      SELECT DISTINCT codigo_produto, categoria, item_cesta, COUNT(*) as qtd
      FROM produtos_catalogo
      GROUP BY codigo_produto, categoria, item_cesta
      ORDER BY codigo_produto
    `);
    console.table(check.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao corrigir categorias:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

fixCategories();
