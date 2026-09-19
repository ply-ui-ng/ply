import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { doctor } from './doctor';

function tempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ply-ui-doctor-'));
}

function writeJson(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function writeHealthyProject(
  cwd: string,
  names: { config: string; css: string; source: string },
): void {
  writeJson(path.join(cwd, names.config), {
    aliases: { components: 'src/app/components', utils: 'src/app/utils' },
    tailwind: { config: 'src/tailwind.css', css: 'src/styles.scss' },
  });

  writeJson(path.join(cwd, 'angular.json'), {
    projects: {
      app: {
        projectType: 'application',
        architect: {
          build: {
            options: {
              assets: ['src/assets'],
            },
          },
        },
      },
    },
  });

  writeJson(path.join(cwd, 'package.json'), {
    dependencies: { '@angular/cdk': '^22.0.0' },
  });

  fs.mkdirSync(path.join(cwd, 'src'), { recursive: true });
  fs.writeFileSync(
    path.join(cwd, 'src/tailwind.css'),
    `@import "tailwindcss";\n@source "${names.source}";\n`,
    'utf8',
  );
  fs.writeFileSync(
    path.join(cwd, 'src/styles.scss'),
    `@import './${names.css}';\n`,
    'utf8',
  );
  fs.writeFileSync(path.join(cwd, `src/${names.css}`), `/* ${names.css} */`, 'utf8');

  fs.mkdirSync(path.join(cwd, 'src/assets'), { recursive: true });
  fs.writeFileSync(path.join(cwd, 'src/assets/icons.svg'), '<svg></svg>', 'utf8');
  fs.writeFileSync(path.join(cwd, 'src/assets/icons-filled.svg'), '<svg></svg>', 'utf8');

  fs.mkdirSync(path.join(cwd, 'src/app/components'), { recursive: true });
}

describe('doctor', () => {
  it('reports all errors for an empty project', async () => {
    const cwd = tempDir();
    await doctor({ cwd });
    expect(process.exitCode).toBe(1);
    // Reset exit code so it does not leak to other tests.
    process.exitCode = 0;
  });

  it('passes when every requirement is satisfied with ply-ui.json', async () => {
    const cwd = tempDir();
    writeHealthyProject(cwd, {
      config: 'ply-ui.json',
      css: 'ply-ui.css',
      source: './app/components',
    });

    await doctor({ cwd });
    expect(process.exitCode).toBe(0);
  });

  it('passes when only legacy base-ui.json / base-ui.css exist', async () => {
    const cwd = tempDir();
    writeHealthyProject(cwd, {
      config: 'base-ui.json',
      css: 'base-ui.css',
      source: './app/components',
    });

    await doctor({ cwd });
    expect(process.exitCode).toBe(0);
  });

  it('warns when @source uses a parent glob instead of the exact components path', async () => {
    const cwd = tempDir();
    writeHealthyProject(cwd, {
      config: 'ply-ui.json',
      css: 'ply-ui.css',
      source: '../src/**/*.{html,ts}',
    });

    await doctor({ cwd });
    expect(process.exitCode).toBe(0);
  });
});
