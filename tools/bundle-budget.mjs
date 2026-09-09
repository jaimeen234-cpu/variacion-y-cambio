#!/usr/bin/env node

/**
 * =============================================================================
 * tools/bundle-budget.mjs — Verificación de presupuesto de bundle gzip (RNF-1 / DD-8)
 * =============================================================================
 *
 * Mide la suma GZIP REAL de todos los archivos que componen el chunk inicial
 * de la aplicación web (los recursos .js y .css cargados inicialmente en index.html).
 * Falla si el total gzip supera los 500 KB (512,000 bytes).
 *
 * CONDICIÓN DE REVISIÓN / DESCALIFICADOR DE EVIDENCIA:
 * Si el build no produjo artefactos o no se pueden identificar los archivos del
 * chunk inicial, la verificación NO debe aprobar por ausencia de datos: debe
 * reportar INCONCLUSO y terminar con código de salida 1.
 * =============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

// Umbral constitucional: 500 KB gzip real (TRD PERF-3 / RNF-1 / DD-8)
const MAX_GZIP_BYTES = 500 * 1024; // 512,000 bytes

console.log('================================================================');
console.log('Verificación de Presupuesto de Bundle Inicial (RNF-1 / DD-8)');
console.log('================================================================\n');

// 1. Localizar el directorio de artefactos del navegador
const candidates = [
  path.join(repoRoot, 'dist', 'variacion-y-cambio', 'browser'),
  path.join(repoRoot, 'dist', 'browser'),
  path.join(repoRoot, 'dist', 'variacion-y-cambio'),
];

let browserDir = null;
for (const dir of candidates) {
  if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))) {
    browserDir = dir;
    break;
  }
}

if (!browserDir) {
  console.error('❌ RESULTADO INCONCLUSO: No se encontró index.html en el directorio dist/.');
  console.error('   El build no produjo artefactos válidos o no se ha ejecutado `ng build`.');
  console.error('   La verificación no puede medir el presupuesto sin datos reales.');
  process.exit(1);
}

const indexPath = path.join(browserDir, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf-8');

// 2. Extraer archivos del chunk inicial referenciados en index.html
const initialFiles = new Set();

// Scripts <script src="...">
const scriptMatches = indexHtml.matchAll(/<script[^>]+src=["']([^"']+)["']/gi);
for (const match of scriptMatches) {
  const src = match[1];
  if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('//')) {
    initialFiles.add(src.replace(/^\.\//, ''));
  }
}

// Links <link rel="stylesheet|modulepreload" href="...">
const linkMatches = indexHtml.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi);
for (const match of linkMatches) {
  const fullTag = match[0];
  const href = match[1];
  const isStylesheet = /rel=["']stylesheet["']/i.test(fullTag);
  const isPreload = /rel=["']modulepreload["']/i.test(fullTag);

  if ((isStylesheet || isPreload) && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('//')) {
    initialFiles.add(href.replace(/^\.\//, ''));
  }
}

if (initialFiles.size === 0) {
  console.error('❌ RESULTADO INCONCLUSO: No se detectaron archivos de chunk inicial en index.html.');
  console.error('   index.html no referencia ningún script o stylesheet local.');
  console.error('   No es posible certificar el presupuesto de bundle inicial.');
  process.exit(1);
}

// 3. Medir tamaño sin comprimir y gzip real de cada archivo
console.log(`Directorio analizado: ${path.relative(repoRoot, browserDir)}`);
console.log(`Archivos del chunk inicial identificados: ${initialFiles.size}\n`);

let totalRawBytes = 0;
let totalGzipBytes = 0;
let missingFiles = false;

const rows = [];

for (const fileName of Array.from(initialFiles).sort()) {
  const filePath = path.join(browserDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo referenciado no encontrado en disco: ${fileName}`);
    missingFiles = true;
    continue;
  }

  const rawBuffer = fs.readFileSync(filePath);
  const gzipBuffer = zlib.gzipSync(rawBuffer);

  const rawBytes = rawBuffer.length;
  const gzipBytes = gzipBuffer.length;

  totalRawBytes += rawBytes;
  totalGzipBytes += gzipBytes;

  rows.push({
    file: fileName,
    rawKb: (rawBytes / 1024).toFixed(2),
    gzipKb: (gzipBytes / 1024).toFixed(2),
  });
}

if (missingFiles) {
  console.error('\n❌ RESULTADO INCONCLUSO: Faltan archivos del chunk inicial requeridos para el cómputo.');
  process.exit(1);
}

// Imprimir tabla de desglose
console.log('Detalle de recursos del chunk inicial:');
for (const r of rows) {
  console.log(`  - ${r.file.padEnd(35)} Raw: ${r.rawKb.padStart(8)} KB | Gzip: ${r.gzipKb.padStart(8)} KB`);
}

const totalRawKb = (totalRawBytes / 1024).toFixed(2);
const totalGzipKb = (totalGzipBytes / 1024).toFixed(2);
const maxGzipKb = (MAX_GZIP_BYTES / 1024).toFixed(2);
const percentage = ((totalGzipBytes / MAX_GZIP_BYTES) * 100).toFixed(1);

console.log('\n----------------------------------------------------------------');
console.log(`Total sin comprimir (Raw):   ${totalRawKb.padStart(8)} KB`);
console.log(`Total comprimido (Gzip real): ${totalGzipKb.padStart(8)} KB`);
console.log(`Presupuesto máximo permitido: ${maxGzipKb.padStart(8)} KB (${percentage}% utilizado)`);
console.log('----------------------------------------------------------------\n');

// 4. Evaluar contra el presupuesto de 500 KB gzip
if (totalGzipBytes > MAX_GZIP_BYTES) {
  const excessKb = ((totalGzipBytes - MAX_GZIP_BYTES) / 1024).toFixed(2);
  console.error(`❌ FALLO DE PRESUPUESTO: El chunk inicial supera los ${maxGzipKb} KB permitidos por ${excessKb} KB.`);
  process.exit(1);
}

console.log(`✔ ÉXITO: Presupuesto respetado (${totalGzipKb} KB gzip <= ${maxGzipKb} KB).\n`);
process.exit(0);
