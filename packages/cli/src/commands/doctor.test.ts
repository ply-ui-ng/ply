import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { angularMajorFromRange, doctor, nodeMeetsDocumentedBar } from './doctor';

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
              styles: ['src/styles.scss'],
            },
          },
        },
      },
    },
  });

  writeJson(path.join(cwd, 'package.json'), {
    dependencies: { '@angular/cdk': '^22.0.0', '@angular/core': '^22.2.1' },
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

  it('fails when @source does not cover the components alias', async () => {
    const cwd = tempDir();
    writeHealthyProject(cwd, {
      config: 'ply-ui.json',
      css: 'ply-ui.css',
      source: './other',
    });

    await doctor({ cwd });
    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
  });

  it('fails when the global stylesheet is missing from angular.json styles', async () => {
    const cwd = tempDir();
    writeHealthyProject(cwd, {
      config: 'ply-ui.json',
      css: 'ply-ui.css',
      source: './app/components',
    });
    const angularPath = path.join(cwd, 'angular.json');
    const angular = JSON.parse(fs.readFileSync(angularPath, 'utf8'));
    angular.projects.app.architect.build.options.styles = ['src/other.scss'];
    fs.writeFileSync(angularPath, JSON.stringify(angular), 'utf8');

    await doctor({ cwd });
    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
  });

  it('fails when @angular/core is not Angular 22', async () => {
    const cwd = tempDir();
    writeHealthyProject(cwd, {
      config: 'ply-ui.json',
      css: 'ply-ui.css',
      source: './app/components',
    });
    const pkgPath = path.join(cwd, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.dependencies['@angular/core'] = '^21.2.0';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg), 'utf8');

    await doctor({ cwd });
    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
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

describe('documented runtime bar', () => {
  it('accepts Node 22.22+, 24.15+, and newer majors', () => {
    expect(nodeMeetsDocumentedBar('22.22.0')).toBe(true);
    expect(nodeMeetsDocumentedBar('22.21.0')).toBe(false);
    expect(nodeMeetsDocumentedBar('24.15.0')).toBe(true);
    expect(nodeMeetsDocumentedBar('24.14.9')).toBe(false);
    expect(nodeMeetsDocumentedBar('18.20.0')).toBe(false);
    expect(nodeMeetsDocumentedBar('25.0.0')).toBe(true);
  });

  it('reads the Angular major from a package range', () => {
    expect(angularMajorFromRange('^22.2.1')).toBe(22);
    expect(angularMajorFromRange('~21.0.0')).toBe(21);
    expect(angularMajorFromRange(undefined)).toBeNull();
  });
});
