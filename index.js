import PrecoDaHoraClient from 'precodahora-ba';

// ==========================================
// CONFIGURAÇÕES DO TESTE
// ==========================================
const GTIN_ALVO = 7896038310197;
const MUNICIPIO = 'vitoria da conquista'; 
const RAIO_KM = 10;
const CNPJ_ALVO = '03915392000107'; 
// ==========================================

async function testarConsulta() {
  try {
    console.log(`⏳ Inicializando cliente PrecoDaHora-BA...`);
    
    const client = new PrecoDaHoraClient({
        timeout: 20000,
        retries: 3
    });

    console.log(`🔎 Buscando GTIN: ${GTIN_ALVO} em ${MUNICIPIO.toUpperCase()}...`);

    const resposta = await client.produto({
      gtin: GTIN_ALVO,
      municipio: MUNICIPIO, 
      raio: RAIO_KM,
      ordenar: "preco.asc"
    });

    const resultados = resposta.resultado || [];
    
    if (resultados.length === 0) {
      console.log('❌ Nenhum dado retornado para este produto.');
      return;
    }

    // Filtra pelo CNPJ exato do endereço
    const resultadoFiltrado = resultados.filter(item => {
      const cnpjItem = String(item.estabelecimento?.cnpj || '').replace(/\D/g, '');
      return cnpjItem === CNPJ_ALVO;
    });

    if (resultadoFiltrado.length > 0) {
      console.log(`\n🎯 --- PRODUTO ENCONTRADO --- \n`);
      
      const oferta = resultadoFiltrado[0]; 
      
      // Montagem do endereço completo concatenando as chaves da nova versão da biblioteca
      const est = oferta.estabelecimento;
      const enderecoFormatado = `${est.endLogradouro || ''} ${est.endNumero || ''} ${est.bairro || ''} - ${est.municipio || ''}`.trim();
      
      // Mapeamento corrigido baseado na estrutura da v2.0.0
      const dadosCompletos = {
        gtin: oferta.produto.gtin,
        descricao: oferta.produto.descricao,
        precoUnitario: oferta.produto.precoUnitario,
        foto: oferta.produto.foto,
        
        // As datas e intervalos agora ficam dentro de 'produto'
        dataEmissao: oferta.produto.data,
        intervaloHora: oferta.produto.intervalo,
        
        // Os dados do estabelecimento possuem chaves específicas agora
        mercado: est.nomeEstabelecimento,
        cnpj: est.cnpj,
        endereco: enderecoFormatado,
        distanciaKm: est.distancia
      };

      console.log(dadosCompletos);
      
    } else {
      console.log(`❌ Produto não encontrado no CNPJ ${CNPJ_ALVO}.\n`);
    }

  } catch (error) {
    console.error('\n🚨 Falha ao consultar a API:', error.message);
  }
}

testarConsulta();