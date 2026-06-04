/**
 * Скрипт автоматического увеличения версии (patch) в package.json
 * Запускать перед сборкой: node scripts/bump-version.js
 *
 * Увеличивает третью цифру версии: 1.0.6 -> 1.0.7
 * Обновляет version в package.json
 * Обновляет PRODUCT_VERSION в electron/assets/installer.nsi
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const PACKAGE_JSON = path.join(ROOT, "package.json");
const INSTALLER_NSI = path.join(ROOT, "electron", "assets", "installer.nsi");

// Читаем package.json
const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, "utf-8"));
const oldVersion = pkg.version;

// Парсим версию
const parts = oldVersion.split(".").map(Number);
if (parts.length !== 3 || parts.some(isNaN)) {
  console.error(`[bump-version] Invalid version format: ${oldVersion}`);
  process.exit(1);
}

// Увеличиваем patch
parts[2] += 1;
const newVersion = parts.join(".");

console.log(`[bump-version] ${oldVersion} → ${newVersion}`);

// Обновляем package.json
pkg.version = newVersion;
fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
console.log(`[bump-version] Updated package.json: version → ${newVersion}`);

// Обновляем installer.nsi, если существует
if (fs.existsSync(INSTALLER_NSI)) {
  let nsiContent = fs.readFileSync(INSTALLER_NSI, "utf-8");
  const oldDefine = `!define PRODUCT_VERSION "${oldVersion}"`;
  const newDefine = `!define PRODUCT_VERSION "${newVersion}"`;

  if (nsiContent.includes(oldDefine)) {
    nsiContent = nsiContent.replace(oldDefine, newDefine);
    fs.writeFileSync(INSTALLER_NSI, nsiContent, "utf-8");
    console.log(
      `[bump-version] Updated installer.nsi: PRODUCT_VERSION → ${newVersion}`,
    );
  } else {
    console.warn(
      `[bump-version] PRODUCT_VERSION "${oldVersion}" not found in installer.nsi`,
    );
  }
}

console.log(`[bump-version] Done! New version: ${newVersion}`);
