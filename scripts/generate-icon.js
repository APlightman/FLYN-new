/**
 * Генерация icon.ico из icon.svg для системного трея и окна приложения.
 * Использует sharp для конвертации SVG -> PNG и png-to-ico для создания ICO.
 *
 * Запуск: node scripts/generate-icon.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, "..", "electron", "assets");
const SVG_PATH = path.join(ASSETS_DIR, "icon.svg");
const ICO_PATH = path.join(ASSETS_DIR, "icon.ico");
const PNG_256_PATH = path.join(ASSETS_DIR, "icon-256.png");
const PNG_64_PATH = path.join(ASSETS_DIR, "icon-64.png");
const PNG_32_PATH = path.join(ASSETS_DIR, "icon-32.png");
const PNG_16_PATH = path.join(ASSETS_DIR, "icon-16.png");

async function generateIcons() {
  if (!fs.existsSync(SVG_PATH)) {
    console.error(`SVG not found: ${SVG_PATH}`);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(SVG_PATH);

  // Генерируем PNG разных размеров
  const sizes = [
    { size: 256, path: PNG_256_PATH },
    { size: 64, path: PNG_64_PATH },
    { size: 32, path: PNG_32_PATH },
    { size: 16, path: PNG_16_PATH },
  ];

  for (const { size, path: pngPath } of sizes) {
    await sharp(svgBuffer).resize(size, size).png().toFile(pngPath);
    console.log(`Generated ${pngPath} (${size}x${size})`);
  }

  // Создаём .ico файл через png-to-ico (поддерживает 256x256)
  const icoBuffer = await pngToIco([
    PNG_16_PATH,
    PNG_32_PATH,
    PNG_64_PATH,
    PNG_256_PATH,
  ]);
  fs.writeFileSync(ICO_PATH, icoBuffer);
  console.log(`Generated ${ICO_PATH} (16x16, 32x32, 64x64, 256x256)`);

  // Удаляем временные PNG (кроме 256x256 для других целей)
  for (const { path: pngPath } of [PNG_64_PATH, PNG_32_PATH, PNG_16_PATH]) {
    if (fs.existsSync(pngPath)) {
      fs.unlinkSync(pngPath);
      console.log(`Removed temporary ${pngPath}`);
    }
  }

  console.log("Done! Icons generated successfully.");
}

generateIcons().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
