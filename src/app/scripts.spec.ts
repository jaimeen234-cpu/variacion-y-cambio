import { describe, expect, it } from 'vitest';

declare const process: { cwd(): string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const require: (id: string) => any;

describe('Contrato de scripts entre package.json y AGENTS.md (RF-4.1 / RF-4.3)', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const repoRoot = path.resolve(process.cwd());
  const packageJsonPath = path.join(repoRoot, 'package.json');
  const agentsMdPath = path.join(repoRoot, 'AGENTS.md');

  it('debe existir package.json y contener la sección scripts', () => {
    expect(fs.existsSync(packageJsonPath)).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(pkg.scripts).toBeDefined();
    expect(typeof pkg.scripts).toBe('object');
  });

  it('debe contener exactamente las claves de scripts del contrato', () => {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const expectedScripts = ['start', 'build', 'test:agent', 'test:arch', 'lint:agent'];

    for (const scriptName of expectedScripts) {
      expect(pkg.scripts, `El script '${scriptName}' debe existir en package.json`).toHaveProperty(scriptName);
      expect(pkg.scripts[scriptName], `El script '${scriptName}' no debe estar vacío`).toBeTruthy();
    }
  });

  it('no debe haber renombrado test:agent a test', () => {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(pkg.scripts).toHaveProperty('test:agent');
    expect(pkg.scripts['test:agent']).toBe('node tools/test-agent.mjs');
  });

  it('debe coincidir con todos los comandos npm listados en la tabla Verification Commands de AGENTS.md', () => {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const agentsMd = fs.readFileSync(agentsMdPath, 'utf-8');

    // Extraer la sección "Verification Commands"
    const sectionMatch = agentsMd.match(/## Verification Commands[\s\S]*?(?=\n## |\n---|$)/);
    expect(sectionMatch, 'AGENTS.md debe contener la sección ## Verification Commands').toBeTruthy();

    const sectionContent: string = sectionMatch[0];

    // Extraer comandos tipo `npm run <nombre>` o `npm start`
    const npmRunRegex = /`npm run ([a-z0-9:-]+)/g;
    const referencedScripts: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = npmRunRegex.exec(sectionContent)) !== null) {
      referencedScripts.push(match[1]);
    }
    if (sectionContent.includes('`npm start`')) {
      referencedScripts.push('start');
    }

    const uniqueScripts = Array.from(new Set(referencedScripts));
    expect(uniqueScripts.length).toBeGreaterThan(0);

    for (const scriptName of uniqueScripts) {
      expect(
        pkg.scripts,
        `El comando referenciado en AGENTS.md '${scriptName}' debe existir en package.json.scripts`
      ).toHaveProperty(scriptName);
    }
  });

  it('el script build debe invocar ng build seguido de tools/bundle-budget.mjs', () => {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(pkg.scripts.build).toContain('ng build');
    expect(pkg.scripts.build).toContain('tools/bundle-budget.mjs');
  });
});
