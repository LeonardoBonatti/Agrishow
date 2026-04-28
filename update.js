const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'js', 'data.js');

// 1. Read file and extract JSON string
let fileContent = fs.readFileSync(dataFilePath, 'utf8');

// Use regex to extract the array string
const match = fileContent.match(/const\s+maquinasMock\s*=\s*(\[\s*\{[\s\S]*\}\s*\])\s*;/);
if (!match) {
    console.error('Could not find maquinasMock array in data.js');
    process.exit(1);
}

let maquinasArray = eval(match[1]);

// 2. We'll find all the prices for the hammers and store them
const hammerPrices = {};

maquinasArray.forEach(machine => {
    if (!machine.detalhes) return;
    const keysToDelete = [];
    for (const key in machine.detalhes) {
        if (key.startsWith('Preço Martelo')) {
            keysToDelete.push(key);
            // Extract the hammer name and variant (Ind)
            // e.g., "Preço Martelo H110GC"
            const matchName = key.match(/Preço Martelo\s+([\w\d]+)(?:\s+\(Ind\))?/);
            if (matchName) {
                const hammerModel = matchName[1];
                if (!hammerPrices[hammerModel]) {
                    hammerPrices[hammerModel] = {};
                }
                if (key.includes('(Ind)')) {
                    hammerPrices[hammerModel]['Preço (Ind)'] = machine.detalhes[key];
                } else {
                    hammerPrices[hammerModel]['Preço'] = machine.detalhes[key];
                }
            }
        }
    }
    // Delete the keys from the machine
    keysToDelete.forEach(k => delete machine.detalhes[k]);
});

// 3. Create the new models for the hammers
let maxId = maquinasArray.reduce((max, m) => Math.max(max, m.id || 0), 0);

for (const model in hammerPrices) {
    maxId++;
    const hammerMachine = {
        id: maxId,
        codigo: model,
        nome: "Rompedor Hidráulico",
        modelo: model,
        familia: "Rompedores Hidráulicos",
        imagem: `https://placehold.co/600x400/FFCC09/000000?text=CAT+${model}`,
        detalhes: {
            "Ficha Técnica": "A ser enviada posteriormente",
            "Preço": hammerPrices[model]['Preço'],
            "Preço (Ind)": hammerPrices[model]['Preço (Ind)']
        }
    };
    maquinasArray.push(hammerMachine);
}

// 4. Write back to data.js
const newArrayStr = JSON.stringify(maquinasArray, null, 2);
const newFileContent = `const maquinasMock = ${newArrayStr};`;
fs.writeFileSync(dataFilePath, newFileContent, 'utf8');

console.log('Update successful! Extracted hammers:', Object.keys(hammerPrices));
