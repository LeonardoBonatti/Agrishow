const sharp = require('sharp');
const path = require('path');

async function resizeIcons() {
  try {
    const imgPath = path.join(__dirname, 'img', 'app_icon.png');

    await sharp(imgPath).resize(192, 192).toFile(path.join(__dirname, 'img', 'icon-192.png'));
    await sharp(imgPath).resize(512, 512).toFile(path.join(__dirname, 'img', 'icon-512.png'));

    console.log("Ícones redimensionados com sucesso!");
  } catch (err) {
    console.error("Erro ao redimensionar:", err);
  }
}

resizeIcons();
