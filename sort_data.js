const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'js', 'data.js');
let content = fs.readFileSync(dataPath, 'utf8');

// Extract the array from the JS file
const match = content.match(/const maquinasMock = (\[[\s\S]*\]);/);
if (!match) {
  console.error('Não foi possível encontrar maquinasMock no arquivo.');
  process.exit(1);
}

const maquinas = JSON.parse(match[1]);
console.log(`Total de máquinas encontradas: ${maquinas.length}`);

// Ordem de famílias (para agrupamento)
const familiaOrder = [
  'Fora de estrada',
  'Miniescavadeira',
  'Escavadeira',
  'Retroescavadeira',
  'Minicarregadeira',
  'Carregadeira',
  'Motoniveladora',
  'Trator Esteiras',
  'Rolo Compactador',
  'Manipulador Hidraulico',
  'Rompedores Hidráulicos',
];

function getFamiliaIndex(familia) {
  const idx = familiaOrder.indexOf(familia);
  return idx === -1 ? 999 : idx;
}

// Extrai o número principal do modelo para ordenação numérica
function getModeloSortKey(modelo) {
  if (!modelo) return [999999, modelo || ''];
  // Remove espaços e trata casos como "316 GC", "302.7", "SEM618D", "D5", "CB2.5", etc.
  const str = modelo.trim();
  
  // Tenta extrair número numérico inicial (ex: "316 GC" -> 316, "302.7" -> 302.7)
  const numMatch = str.match(/^(\d+\.?\d*)/);
  if (numMatch) {
    const num = parseFloat(numMatch[1]);
    // Sufixo após o número (ex: " GC", " NG", etc.) para sub-ordenação
    const suffix = str.slice(numMatch[1].length).trim();
    return [num, suffix];
  }
  
  // Modelos que começam com letras (ex: "D4", "CB7", "SEM618D", "H110GC")
  // Separa prefixo de letras e número
  const alphaNumMatch = str.match(/^([A-Za-z]+)(\d+\.?\d*)(.*)/);
  if (alphaNumMatch) {
    const prefix = alphaNumMatch[1];
    const num = parseFloat(alphaNumMatch[2]);
    const suffix = alphaNumMatch[3].trim();
    // Usa o prefixo como base de ordenação + número
    return [900000 + prefix.charCodeAt(0) * 1000 + num, suffix];
  }
  
  return [999999, str];
}

function getArranjo(maquina) {
  if (maquina.detalhes && maquina.detalhes['Arranjo']) {
    return parseInt(maquina.detalhes['Arranjo'], 10) || 0;
  }
  return 0;
}

// Ordena as máquinas
maquinas.sort((a, b) => {
  // 1. Por família
  const famA = getFamiliaIndex(a.familia);
  const famB = getFamiliaIndex(b.familia);
  if (famA !== famB) return famA - famB;

  // 2. Por modelo (numericamente)
  const keyA = getModeloSortKey(a.modelo);
  const keyB = getModeloSortKey(b.modelo);
  if (keyA[0] !== keyB[0]) return keyA[0] - keyB[0];
  if (keyA[1] !== keyB[1]) return keyA[1].localeCompare(keyB[1]);

  // 3. Por arranjo
  const arrA = getArranjo(a);
  const arrB = getArranjo(b);
  return arrA - arrB;
});

// Reatribui IDs sequenciais
maquinas.forEach((m, i) => {
  m.id = i + 1;
});

// Reconstrói o arquivo
const newContent = `const maquinasMock = ${JSON.stringify(maquinas, null, 2)};\n`;
fs.writeFileSync(dataPath, newContent, 'utf8');

console.log('✅ Máquinas ordenadas com sucesso!');
console.log('\nOrdem final:');
let lastFamilia = '';
maquinas.forEach((m, i) => {
  if (m.familia !== lastFamilia) {
    console.log(`\n  📁 ${m.familia}`);
    lastFamilia = m.familia;
  }
  const arranjo = m.detalhes && m.detalhes['Arranjo'] ? ` | Arranjo ${m.detalhes['Arranjo']}` : '';
  console.log(`    [${String(i+1).padStart(2)}] ${m.modelo}${arranjo}`);
});
