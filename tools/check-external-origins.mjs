#!/usr/bin/env node

/**
 * =============================================================================
 * tools/check-external-origins.mjs — Verificación de cero orígenes externos (RF-8.1)
 * =============================================================================
 *
 * Inspecciona los artefactos generados en dist/ (.js, .css, .html) buscando
 * referencias http:// y https:// literales.
 *
 * LISTA BLANCA DE ORÍGENES EXTERNOS: Vacía (Cero CDNs, librerías o APIs externas).
 *
 * EXCEPCIÓN DOCUMENTADA DE NAMESPACES XML:
 *  - Los identificadores URI estándar del W3C (http://www.w3.org/*) emitidos por
 *    @angular/core en el bundle de producción para manipulación de SVG/MathML en
 *    el DOM (document.createElementNS) son URIs de especificación y no representan
 *    orígenes de red ni peticiones externas de recursos.
 * =============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(repoRoot, 'dist');

const TARGET_EXTENSIONS = new Set(['.js', '.mjs', '.css', '.html']);
const URL_REGEX = /https?:\/\/[^\s"'`<>\\)]+/gi;
const W3C_XML_NAMESPACES = /^https?:\/\/www\.w3\.org\//i;

function collectFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else if (entry.isFile() && TARGET_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = collectFiles(distDir);

if (files.length === 0) {
  console.error('Error: No se encontraron artefactos (.js, .css, .html) en dist/.');
  console.error('Ejecute `npm run build` antes de ejecutar esta verificación.');
  process.exit(1);
}

const infractions = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const matches = content.match(URL_REGEX) || [];
  const relativePath = path.relative(repoRoot, file);

  for (const match of matches) {
    if (W3C_XML_NAMESPACES.test(match)) {
      continue;
    }
    infractions.push({ file: relativePath, url: match });
  }
}

if (infractions.length > 0) {
  console.error(`✘ Se encontraron ${infractions.length} referencias a orígenes externos en dist/:`);
  for (const { file, url } of infractions) {
    console.error(`  - ${file}: ${url}`);
  }
  process.exit(1);
}

console.log(`✔ Cero orígenes externos: ${files.length} archivos analizados en dist/ (.js, .css, .html).`);
process.exit(0);
