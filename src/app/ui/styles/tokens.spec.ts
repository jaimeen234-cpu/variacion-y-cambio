/**
 * =============================================================================
 * tokens.spec.ts — Verificación unitaria de tokens de diseño
 * =============================================================================
 * EXCEPCIÓN DECLARADA A RF-5.3 (Enmienda D-3, aprobada 2026-09-09):
 * Este archivo es una excepción declarada a RF-5.3 por la enmienda D-3.
 * Sostiene valores hexadecimales en claro a propósito porque actúa como
 * VERIFICADOR independiente de tokens, no como un consumidor de estilos.
 * =============================================================================
 */

import { describe, expect, it } from 'vitest';

declare const process: { cwd(): string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const require: (id: string) => any;

function cargarTokensScss(): { contenido: string; tokens: Map<string, string> } {
  const fs = require('node:fs');
  const path = require('node:path');
  const rutaTokens = path.resolve(process.cwd(), 'src/app/ui/styles/_tokens.scss');
  const contenido = fs.readFileSync(rutaTokens, 'utf-8');
  const tokens = new Map<string, string>();
  const regex = /(--vc-[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(contenido)) !== null) {
    tokens.set(match[1].trim(), match[2].trim());
  }
  return { contenido, tokens };
}

describe('Design Tokens (_tokens.scss)', () => {
  const { contenido, tokens } = cargarTokensScss();

  describe('Acentos verificados contra BLK Design System (custom/_variables.scss)', () => {
    it('debe coincidir exactamente con los valores de acento verificados de BLK', () => {
      expect(tokens.get('--vc-primary')).toBe('#e14eca');
      expect(tokens.get('--vc-info')).toBe('#1d8cf8');
      expect(tokens.get('--vc-success')).toBe('#00f2c3');
      expect(tokens.get('--vc-warning')).toBe('#ff8d72');
      expect(tokens.get('--vc-danger')).toBe('#fd5d93');
      expect(tokens.get('--vc-primary-states')).toBe('#ba54f5');
    });
  });

  describe('Superficies (Black Dashboard — Desviación declarada DD-2)', () => {
    it('debe coincidir con la paleta de dashboard validada visualmente', () => {
      expect(tokens.get('--vc-bg-base')).toBe('#1e1e2f');
      expect(tokens.get('--vc-bg-surface')).toBe('#27293d');
      expect(tokens.get('--vc-bg-elevated')).toBe('#2b3553');
    });
  });

  describe('Gradientes verificados contra BLK Design System (custom/_misc.scss)', () => {
    it('debe contener los gradientes característicos de BLK', () => {
      const gradPrimary = tokens.get('--vc-grad-primary');
      expect(gradPrimary).toBeDefined();
      expect(gradPrimary).toContain('#ba54f5');
      expect(gradPrimary).toContain('#e14eca');

      const gradInfo = tokens.get('--vc-grad-info');
      expect(gradInfo).toBeDefined();
      expect(gradInfo).toContain('#1d8cf8');
      expect(gradInfo).toContain('#3358f4');

      const gradCard = tokens.get('--vc-grad-card');
      expect(gradCard).toBeDefined();
      expect(gradCard).toContain('#1e1e2f');
      expect(gradCard).toContain('#1e1e24');
    });
  });

  describe('Texto principal verificado contra BLK Design System', () => {
    it('debe coincidir con el color de texto primario', () => {
      expect(tokens.get('--vc-text-primary')).toBe('#ffffff');
    });
  });

  describe('Catálogo completo de grupos (design.md §7)', () => {
    it('debe declarar todos los grupos de tokens requeridos', () => {
      // Tipografía
      expect(tokens.has('--vc-font-sans')).toBe(true);
      expect(tokens.has('--vc-font-mono')).toBe(true);
      expect(tokens.has('--vc-fs-display')).toBe(true);
      expect(tokens.has('--vc-fs-h1')).toBe(true);
      expect(tokens.has('--vc-fs-h2')).toBe(true);
      expect(tokens.has('--vc-fs-body')).toBe(true);
      expect(tokens.has('--vc-fs-caption')).toBe(true);
      expect(tokens.has('--vc-fs-metric')).toBe(true);

      // Espaciado
      for (let i = 1; i <= 6; i++) {
        expect(tokens.has(`--vc-space-${i}`)).toBe(true);
      }

      // Radios
      expect(tokens.has('--vc-radius-sm')).toBe(true);
      expect(tokens.has('--vc-radius-md')).toBe(true);
      expect(tokens.has('--vc-radius-lg')).toBe(true);

      // Sombras
      expect(tokens.has('--vc-shadow-card')).toBe(true);
      expect(tokens.has('--vc-shadow-raised')).toBe(true);

      // Movimiento
      expect(tokens.has('--vc-motion-fast')).toBe(true);
      expect(tokens.has('--vc-motion-base')).toBe(true);
      expect(tokens.has('--vc-tick-sim')).toBe(true);

      // Breakpoints
      expect(tokens.has('--vc-bp-sm')).toBe(true);
      expect(tokens.has('--vc-bp-md')).toBe(true);
      expect(tokens.has('--vc-bp-lg')).toBe(true);
      expect(tokens.has('--vc-bp-xl')).toBe(true);
    });
  });

  describe('Comentario de ausencia deliberada de modo claro (RF-9.3 / design.md §11)', () => {
    it('debe registrar explícitamente en el archivo que la ausencia de prefers-color-scheme es deliberada', () => {
      expect(contenido).toContain('prefers-color-scheme: light');
      expect(contenido.toLowerCase()).toContain('deliberada');
    });
  });
});
