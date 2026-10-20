import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { discoverProjectLayout, insertComponentSource, writeEditorKit } from './init';

function tempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ply-ui-init-'));
}

describe('discoverProjectLayout', () => {
  it('uses the stylesheet angular.json already lists when that file imports Tailwind', () => {
    const cwd = tempDir();
    fs.mkdirSync(path.join(cwd, 'src'), { recursive: true });
    fs.writeFileSync(path.join(cwd, 'src/styles.css'), `@import "tailwindcss";\n`, 'utf8');
    fs.writeFileSync(
      path.join(cwd, 'angular.json'),
      JSON.stringify({
        projects: {
          app: {
            projectType: 'application',
            sourceRoot: 'src',
            architect: { build: { options: { styles: ['src/styles.css'] } } },
          },
        },
      }),
      'utf8',
    );

    expect(discoverProjectLayout(cwd)).toEqual({
      componentsAlias: 'src/app/components',
      styles: 'src/styles.css',
      tailwind: 'src/styles.css',
    });
  });

  it('keeps a separate Tailwind entry when the global stylesheet does not import Tailwind', () => {
    const cwd = tempDir();
    fs.mkdirSync(path.join(cwd, 'src'), { recursive: true });
    fs.writeFileSync(path.join(cwd, 'src/styles.scss'), `body { margin: 0; }\n`, 'utf8');
    fs.writeFileSync(path.join(cwd, 'src/tailwind.css'), `@import "tailwindcss";\n`, 'utf8');
    fs.writeFileSync(
      path.join(cwd, 'angular.json'),
      JSON.stringify({
        projects: {
          app: {
            projectType: 'application',
            architect: { build: { options: { styles: ['src/styles.scss'] } } },
          },
        },
      }),
      'utf8',
    );

    expect(discoverProjectLayout(cwd)).toEqual({
      componentsAlias: 'src/app/components',
      styles: 'src/styles.scss',
      tailwind: 'src/tailwind.css',
    });
  });
});

describe('writeEditorKit', () => {
  it('writes the skill to Cursor and .agents, and refreshes a rule that is already there', () => {
    const cwd = tempDir();
    const rule = path.join(cwd, '.cursor/rules/ply-ui.mdc');
    fs.mkdirSync(path.dirname(rule), { recursive: true });
    fs.writeFileSync(rule, 'stale\n', 'utf8');

    writeEditorKit(cwd);
    expect(fs.readFileSync(rule, 'utf8')).toBe('stale\n');
    expect(fs.existsSync(path.join(cwd, '.cursor/skills/ply-ui-design/SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(cwd, '.agents/skills/ply-ui-design/SKILL.md'))).toBe(true);

    writeEditorKit(cwd, { refresh: true });
    const refreshed = fs.readFileSync(rule, 'utf8');
    expect(refreshed).not.toBe('stale\n');
    expect(refreshed).toContain('Ply');
    expect(fs.readFileSync(path.join(cwd, '.agents/skills/ply-ui-design/SKILL.md'), 'utf8')).toContain(
      'ply-ui-design',
    );
  });
});

describe('insertComponentSource', () => {
  it('appends @source when the components alias is not covered', () => {
    const result = insertComponentSource(
      `@import "tailwindcss";\n`,
      '/app/src/styles.css',
      '/app/src/app/components',
    );
    expect(result.inserted).toBe(true);
    expect(result.content).toContain('@source "./app/components";');
  });

  it('leaves a covering @source unchanged', () => {
    const css = `@import "tailwindcss";\n@source "./app/components";\n`;
    const result = insertComponentSource(css, '/app/src/styles.css', '/app/src/app/components');
    expect(result.inserted).toBe(false);
    expect(result.content).toBe(css);
  });
});
