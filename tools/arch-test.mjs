#!/usr/bin/env node

/**
 * =============================================================================
 * tools/arch-test.mjs — Verificación de arquitectura hexagonal (TRD §4 / RF-3)
 * =============================================================================
 *
 * Analiza el árbol de dependencias e imports mediante la API del compilador de
 * TypeScript (ts.createSourceFile). Garantiza que ninguna capa viole la frontera
 * arquitectónica definida en el TRD §4 y design.md §7.1.
 *
 * ENMIENDAS APLICADAS (2026-09-09):
 *  - D-1: La tabla de reglas se implementa como LISTA NEGRA. Rige la columna
 *    'Prohíbe'. Un especificador de paquete npm que no figure en ella está
 *    permitido (ej. 'vitest' en domain/ y application/ es legal).
 *  - D-2: La pasada 3 (alcanzabilidad desde main.ts — RF-2.2) NO forma parte de T-3;
 *    ha sido diferida a la tarea T-11 (tras T-6) cuando src/app/ui/ exista.
 *
 * RAIZ DE COMPOSICION:
 *  - Archivos directamente bajo src/app/ (app.ts, app.config.ts, app.routes.ts,
 *    app.spec.ts) más src/main.ts viven por encima de las capas y actúan como
 *    raíz de composición. Se tratan con las mismas reglas que ui/ (todo permitido).
 * =============================================================================
 */

import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

/**
 * Infracciones esperadas en la Pasada 2 (auto-verificación de fixtures).
 */
const EXPECTED_FIXTURE_INFRACTIONS = [
  {
    file: 'tools/fixtures/arch/domain-viola-angular.ts',
    specifier: '@angular/core',
  },
  {
    file: 'tools/fixtures/arch/application-viola-infra.ts',
    specifier: '../../../src/app/infrastructure/tiempo/reloj-sistema',
  },
];

/**
 * Determina la capa a la que pertenece un archivo fuente.
 * @param {string} filePath Ruta absoluta o relativa al archivo.
 * @returns {'domain' | 'application' | 'infrastructure' | 'ui' | 'root' | 'unknown'}
 */
function getSourceLayer(filePath) {
  const relPath = path.relative(repoRoot, filePath).replace(/\\/g, '/');

  // Fixtures de prueba en tools/fixtures/arch/
  if (relPath.startsWith('tools/fixtures/arch/')) {
    const base = path.basename(relPath);
    if (base.startsWith('domain-')) return 'domain';
    if (base.startsWith('application-')) return 'application';
    if (base.startsWith('infrastructure-')) return 'infrastructure';
    if (base.startsWith('ui-')) return 'ui';
  }

  // Capas bajo src/app/
  const layerMatch = relPath.match(/^src\/app\/(domain|application|infrastructure|ui)\//);
  if (layerMatch) {
    return layerMatch[1];
  }

  // Raíz de composición: src/main.ts y archivos directamente bajo src/app/
  if (relPath === 'src/main.ts' || /^src\/app\/[^/]+\.ts$/.test(relPath)) {
    return 'root';
  }

  return 'unknown';
}

/**
 * Resuelve el destino de un import specifier a una capa o paquete npm.
 * @param {string} fromFilePath Ruta absoluta del archivo emisor.
 * @param {string} specifier Texto exacto del módulo importado.
 * @returns {{ type: 'layer', layer: string, path?: string } | { type: 'package', name: string }}
 */
function resolveTarget(fromFilePath, specifier) {
  // 1. Imports relativos
  if (specifier.startsWith('.')) {
    const absTarget = path.resolve(path.dirname(fromFilePath), specifier);
    const relTarget = path.relative(repoRoot, absTarget).replace(/\\/g, '/');

    if (/^src\/app\/domain(\b|\/)/.test(relTarget)) {
      return { type: 'layer', layer: 'domain', path: relTarget };
    }
    if (/^src\/app\/application(\b|\/)/.test(relTarget)) {
      return { type: 'layer', layer: 'application', path: relTarget };
    }
    if (/^src\/app\/infrastructure(\b|\/)/.test(relTarget)) {
      return { type: 'layer', layer: 'infrastructure', path: relTarget };
    }
    if (/^src\/app\/ui(\b|\/)/.test(relTarget)) {
      return { type: 'layer', layer: 'ui', path: relTarget };
    }
    if (relTarget === 'src/main' || relTarget.startsWith('src/main.') || /^src\/app\/[^/]+$/.test(relTarget)) {
      return { type: 'layer', layer: 'root', path: relTarget };
    }

    if (relTarget.includes('tools/fixtures/arch/')) {
      const base = path.basename(relTarget);
      if (base.startsWith('domain-')) return { type: 'layer', layer: 'domain', path: relTarget };
      if (base.startsWith('application-')) return { type: 'layer', layer: 'application', path: relTarget };
      if (base.startsWith('infrastructure-')) return { type: 'layer', layer: 'infrastructure', path: relTarget };
      if (base.startsWith('ui-')) return { type: 'layer', layer: 'ui', path: relTarget };
    }

    return { type: 'layer', layer: 'unknown', path: relTarget };
  }

  // 2. Alias o rutas absolutas internas
  if (specifier.startsWith('src/app/domain/') || specifier.startsWith('domain/')) {
    return { type: 'layer', layer: 'domain' };
  }
  if (specifier.startsWith('src/app/application/') || specifier.startsWith('application/')) {
    return { type: 'layer', layer: 'application' };
  }
  if (specifier.startsWith('src/app/infrastructure/') || specifier.startsWith('infrastructure/')) {
    return { type: 'layer', layer: 'infrastructure' };
  }
  if (specifier.startsWith('src/app/ui/') || specifier.startsWith('ui/')) {
    return { type: 'layer', layer: 'ui' };
  }
  if (specifier.startsWith('src/app/')) {
    return { type: 'layer', layer: 'root' };
  }

  // 3. Paquete npm
  return { type: 'package', name: specifier };
}

/**
 * Evalúa si una dependencia viola la lista negra de la capa de origen (D-1 / TRD §4).
 * @param {string} sourceLayer Capa del archivo emisor.
 * @param {{ type: 'layer', layer: string, path?: string } | { type: 'package', name: string }} target Destino.
 * @returns {string | null} Mensaje de la violación o null si está permitido.
 */
function checkRule(sourceLayer, target) {
  // Capa UI y Raíz de composición: todo permitido
  if (sourceLayer === 'ui' || sourceLayer === 'root') {
    return null;
  }

  // Capa DOMAIN: prohíbe @angular/*, rxjs, chart.js, three, application/, infrastructure/, ui/, root
  if (sourceLayer === 'domain') {
    if (target.type === 'package') {
      if (target.name === '@angular' || target.name.startsWith('@angular/')) {
        return "La capa 'domain' prohíbe importar del framework '@angular/*'.";
      }
      if (target.name === 'rxjs' || target.name.startsWith('rxjs/')) {
        return "La capa 'domain' prohíbe importar de la librería 'rxjs'.";
      }
      if (target.name === 'chart.js' || target.name.startsWith('chart.js/')) {
        return "La capa 'domain' prohíbe importar de 'chart.js'.";
      }
      if (target.name === 'three' || target.name.startsWith('three/')) {
        return "La capa 'domain' prohíbe importar de 'three'.";
      }
      // Cualquier otro paquete npm (como 'vitest') está PERMITIDO bajo lista negra (D-1)
      return null;
    }

    if (target.type === 'layer') {
      if (target.layer === 'application') {
        return "La capa 'domain' prohíbe importar desde la capa 'application/'.";
      }
      if (target.layer === 'infrastructure') {
        return "La capa 'domain' prohíbe importar desde la capa 'infrastructure/'.";
      }
      if (target.layer === 'ui') {
        return "La capa 'domain' prohíbe importar desde la capa 'ui/'.";
      }
      if (target.layer === 'root') {
        return "La capa 'domain' prohíbe importar desde la raíz de composición.";
      }
      return null; // domain importando domain es legal
    }
  }

  // Capa APPLICATION: prohíbe @angular/*, infrastructure/, ui/, root
  if (sourceLayer === 'application') {
    if (target.type === 'package') {
      if (target.name === '@angular' || target.name.startsWith('@angular/')) {
        return "La capa 'application' prohíbe importar del framework '@angular/*'.";
      }
      return null;
    }

    if (target.type === 'layer') {
      if (target.layer === 'infrastructure') {
        return "La capa 'application' prohíbe importar desde la capa 'infrastructure/'.";
      }
      if (target.layer === 'ui') {
        return "La capa 'application' prohíbe importar desde la capa 'ui/'.";
      }
      if (target.layer === 'root') {
        return "La capa 'application' prohíbe importar desde la raíz de composición.";
      }
      return null; // application importando domain o application es legal
    }
  }

  // Capa INFRASTRUCTURE: prohíbe ui/
  if (sourceLayer === 'infrastructure') {
    if (target.type === 'layer' && target.layer === 'ui') {
      return "La capa 'infrastructure' prohíbe importar desde la capa 'ui/'.";
    }
    return null;
  }

  return null;
}

/**
 * Parsea un archivo TypeScript usando ts.createSourceFile y extrae todos sus imports.
 * Ignora declaraciones puramente de tipos ('import type' / 'export type') según RF-3.3.
 * @param {string} filePath Ruta absoluta del archivo.
 * @returns {Array<{ specifier: string, isTypeOnly: boolean, line: number }>}
 */
function parseImports(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true
  );

  const imports = [];

  function isAllTypeOnly(namedBindings) {
    if (!namedBindings) return false;
    if (ts.isNamedImports(namedBindings) || ts.isNamedExports(namedBindings)) {
      return (
        namedBindings.elements.length > 0 &&
        namedBindings.elements.every((el) => el.isTypeOnly)
      );
    }
    return false;
  }

  function visit(node) {
    // 1. Declaraciones import
    if (ts.isImportDeclaration(node)) {
      let isTypeOnly = !!node.importClause?.isTypeOnly;
      if (!isTypeOnly && node.importClause?.namedBindings) {
        isTypeOnly = isAllTypeOnly(node.importClause.namedBindings);
      }

      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const line =
          sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
            .line + 1;
        imports.push({
          specifier: node.moduleSpecifier.text,
          isTypeOnly,
          line,
        });
      }
    }
    // 2. Declaraciones export ... from '...'
    else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      let isTypeOnly = !!node.isTypeOnly;
      if (!isTypeOnly && node.exportClause) {
        isTypeOnly = isAllTypeOnly(node.exportClause);
      }
      const line =
        sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
          .line + 1;
      imports.push({
        specifier: node.moduleSpecifier.text,
        isTypeOnly,
        line,
      });
    }
    // 3. Dynamic import(...)
    else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      if (node.arguments.length > 0 && ts.isStringLiteral(node.arguments[0])) {
        const line =
          sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
            .line + 1;
        imports.push({
          specifier: node.arguments[0].text,
          isTypeOnly: false,
          line,
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return imports;
}

/**
 * Analiza un archivo TypeScript y devuelve la lista de infracciones detectadas.
 * @param {string} filePath Ruta absoluta del archivo.
 * @returns {Array<{ file: string, line: number, specifier: string, sourceLayer: string, reason: string }>}
 */
function analyzeFile(filePath) {
  const sourceLayer = getSourceLayer(filePath);
  const imports = parseImports(filePath);
  const infractions = [];

  for (const imp of imports) {
    // RF-3.3: Las declaraciones import type se ignoran (no crean acoplamiento en runtime)
    if (imp.isTypeOnly) {
      continue;
    }

    const target = resolveTarget(filePath, imp.specifier);
    const violation = checkRule(sourceLayer, target);
    if (violation) {
      const relFile = path.relative(repoRoot, filePath).replace(/\\/g, '/');
      infractions.push({
        file: relFile,
        line: imp.line,
        specifier: imp.specifier,
        sourceLayer,
        reason: violation,
      });
    }
  }

  return infractions;
}

/**
 * Obtiene recursivamente todos los archivos .ts de un directorio.
 * @param {string} dir Directorio a explorar.
 * @returns {string[]} Lista de rutas absolutas.
 */
function getTsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      const parentDir = entry.parentPath || dir;
      files.push(path.join(parentDir, entry.name));
    }
  }
  return files;
}

// =============================================================================
// EJECUCIÓN PRINCIPAL
// =============================================================================

function main() {
  console.log('================================================================');
  console.log('Verificación de Arquitectura Hexagonal (TRD §4 / RF-3)');
  console.log('================================================================\n');

  let hasError = false;

  // ---------------------------------------------------------------------------
  // PASADA 1: src/app/ (debe salir completamente limpia)
  // ---------------------------------------------------------------------------
  console.log('--- PASADA 1: Análisis de src/app/ (código de producción y pruebas) ---');
  const appDir = path.join(repoRoot, 'src', 'app');
  const appFiles = getTsFiles(appDir);

  const pasada1Infractions = [];
  for (const file of appFiles) {
    const infractions = analyzeFile(file);
    pasada1Infractions.push(...infractions);
  }

  console.log(`Archivos analizados en src/app/: ${appFiles.length}`);
  console.log(`Infracciones encontradas: ${pasada1Infractions.length}`);

  if (pasada1Infractions.length > 0) {
    hasError = true;
    console.error('\n❌ FALLO EN PASADA 1: Se encontraron infracciones en src/app/:');
    for (const inf of pasada1Infractions) {
      console.error(`  - ${inf.file}:${inf.line} -> import '${inf.specifier}'`);
      console.error(`    Motivo: ${inf.reason}`);
    }
    console.error('');
  } else {
    console.log('✔ Pasada 1 superada: 0 infracciones en src/app/.\n');
  }

  // ---------------------------------------------------------------------------
  // PASADA 2: Auto-verificación permanente con fixtures en tools/fixtures/arch/
  // ---------------------------------------------------------------------------
  console.log('--- PASADA 2: Auto-verificación permanente de fixtures (tools/fixtures/arch/) ---');
  const fixturesDir = path.join(repoRoot, 'tools', 'fixtures', 'arch');
  const fixtureFiles = getTsFiles(fixturesDir);

  const pasada2Infractions = [];
  for (const file of fixtureFiles) {
    const infractions = analyzeFile(file);
    pasada2Infractions.push(...infractions);
  }

  const expectedCount = EXPECTED_FIXTURE_INFRACTIONS.length;
  const foundCount = pasada2Infractions.length;

  console.log(`Archivos analizados en fixtures: ${fixtureFiles.length}`);
  console.log(`Infracciones esperadas: ${expectedCount}`);
  console.log(`Infracciones encontradas: ${foundCount}`);

  // Validamos número de infracciones
  let pasada2Matches = foundCount === expectedCount;

  // Validamos cada infracción esperada
  for (const expected of EXPECTED_FIXTURE_INFRACTIONS) {
    const found = pasada2Infractions.find(
      (inf) => inf.file === expected.file && inf.specifier === expected.specifier
    );
    if (!found) {
      pasada2Matches = false;
      console.error(`❌ Infracción esperada NO detectada: ${expected.file} -> '${expected.specifier}'`);
    }
  }

  // Validamos que no haya infracciones inesperadas
  for (const found of pasada2Infractions) {
    const expected = EXPECTED_FIXTURE_INFRACTIONS.find(
      (exp) => exp.file === found.file && exp.specifier === found.specifier
    );
    if (!expected) {
      pasada2Matches = false;
      console.error(`❌ Infracción NO esperada detectada en fixture: ${found.file}:${found.line} -> '${found.specifier}'`);
    }
  }

  if (!pasada2Matches) {
    hasError = true;
    console.error('\n❌ FALLO EN PASADA 2: La auto-verificación de fixtures no produjo el resultado esperado.\n');
  } else {
    console.log(`✔ Pasada 2 superada: se detectaron exactamente las ${expectedCount} infracciones esperadas.\n`);
  }

  // ===========================================================================
  // PASADA 3 (Alcanzabilidad desde main.ts — RF-2.2):
  // NOTA DE DISEÑO (Enmienda D-2, aprobada 2026-09-09):
  // La comprobación de alcanzabilidad desde main.ts no se implementa en esta tarea (T-3).
  // Ha sido asignada a la tarea T-11 (tras T-6), ya que la capa src/app/ui/ todavía
  // no existe. Implementarla prematuramente provocaría un fallo por construcción
  // ajeno a defectos de código. El hueco en este punto es deliberado y planificado.
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // Veredicto final
  // ---------------------------------------------------------------------------
  if (hasError) {
    console.error('================================================================');
    console.error('VEREDICTO: FALLO — La prueba de arquitectura no pasó.');
    console.error('================================================================');
    process.exit(1);
  } else {
    console.log('================================================================');
    console.log('VEREDICTO: ÉXITO — Todas las pasadas arquitectónicas superadas.');
    console.log('================================================================');
    process.exit(0);
  }
}

main();
