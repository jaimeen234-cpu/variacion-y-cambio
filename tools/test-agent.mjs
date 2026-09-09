#!/usr/bin/env node

/**
 * =============================================================================
 * tools/test-agent.mjs — Runner agent-lean para pruebas unitarias (RF-1.3 / RF-1.4)
 * =============================================================================
 *
 * Contrato agent-lean (AGENTS.md / RF-1.3 / RF-1.4):
 *  - En verde: Silencioso, imprime como máximo una sola línea de resumen.
 *  - En rojo: Salida COMPLETA y VERBATIM sin recortar nada, garantizando
 *    que toda la evidencia del fallo esté disponible para el agente o auditor.
 *  - Permite argumentos adicionales transparentemente (ej. --include='...').
 * =============================================================================
 */

import { spawn } from 'node:child_process';
import process from 'node:process';

const extraArgs = process.argv.slice(2);
const ngArgs = ['test', '--watch=false', ...extraArgs];

const child = spawn('npx', ['ng', ...ngArgs], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
  env: { ...process.env, CI: 'true' },
});

let stdout = '';
let stderr = '';

child.stdout.on('data', (chunk) => {
  stdout += chunk.toString();
});

child.stderr.on('data', (chunk) => {
  stderr += chunk.toString();
});

child.on('close', (code) => {
  if (code === 0) {
    // Éxito: Extraer número de pruebas y archivos pasados para emitir una sola línea de resumen
    const cleanStdout = stdout.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
    const testsMatch = cleanStdout.match(/Tests\s+([0-9]+\s+passed(?:\s*\([0-9]+\))?)/i);
    const filesMatch = cleanStdout.match(/Test Files\s+([0-9]+\s+passed(?:\s*\([0-9]+\))?)/i);

    let summary = '✔ All tests passed successfully.';
    if (testsMatch && filesMatch) {
      summary = `✔ Tests: ${testsMatch[1].trim()} (${filesMatch[1].trim()})`;
    } else if (testsMatch) {
      summary = `✔ Tests: ${testsMatch[1].trim()}`;
    }

    console.log(summary);
    process.exitCode = 0;
  } else {
    // Fallo: Salida completa y verbatim
    process.stdout.write(stdout);
    process.stderr.write(stderr);
    process.exitCode = code ?? 1;
  }
});
