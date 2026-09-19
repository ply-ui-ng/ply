import fs from 'fs';
import path from 'path';
import { ora } from '../vendor';
import { SITE_URL } from '../registry';
import { CLI_NPX } from '../brand';
import {
  CONFIG_FILE,
  CSS_FILE,
  LEGACY_CONFIG_FILE,
  LEGACY_CSS_FILE,
  configFilePath,
  cssImportCandidates,
} from '../paths';

type CheckStatus = 'ok' | 'warn' | 'error';

interface Check {
  name: string;
  status: CheckStatus;
  message: string;
}

interface DoctorConfig {
  aliases?: { components?: string; utils?: string };
  tailwind?: { config?: string; css?: string };
}

const ICON_SPRITES = ['icons.svg', 'icons-filled.svg'];

function pickAngularProject(angularJson: any): { name: string; project: any } | null {
  const projects = angularJson?.projects || {};
  const names = Object.keys(projects);
  if (!names.length) return null;
  const appName =
    names.find((n) => projects[n].projectType === 'application' && projects[n].architect?.build) ||
    names.find((n) => projects[n].architect?.build) ||
    names[0];
  return { name: appName, project: projects[appName] };
}

function resolveAssetsDir(cwd: string, angularJson: any): string {
  const picked = pickAngularProject(angularJson);
  const buildOptions = picked?.project?.architect?.build?.options;
  if (!buildOptions) return path.resolve(cwd, 'src/assets');

  const assets: any[] = buildOptions.assets || [];
  const hasSrcAssets = assets.some(
    (a) => a === 'src/assets' || (typeof a === 'object' && a?.input === 'src/assets'),
  );
  const publicEntry = assets.find(
    (a) => a === 'public' || (typeof a === 'object' && a?.input === 'public'),
  );

  if (hasSrcAssets) return path.resolve(cwd, 'src/assets');
  if (publicEntry) return path.resolve(cwd, 'public/assets');
  return path.resolve(cwd, 'src/assets');
}

function readJsonSafe<T = any>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}

function readTextSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function sourceCovers(source: string, tailwindDir: string, targetDir: string): boolean {
  const raw = source.replace(/[*?[\]{}].*$/, '');
  const resolved = path.resolve(tailwindDir, raw);
  const resolvedDir =
    raw.endsWith('/') || raw.endsWith('\\') || path.extname(raw) === '' ? resolved : path.dirname(resolved);
  return targetDir === resolvedDir || targetDir.startsWith(resolvedDir + path.sep);
}

export interface DoctorOptions {
  cwd?: string;
}

export async function doctor(options: DoctorOptions = {}): Promise<void> {
  const cwd = options.cwd || process.cwd();
  const relative = (filePath: string) => path.relative(cwd, filePath) || '.';
  const spinner = ora('Checking Ply setup...').start();
  const checks: Check[] = [];

  // 1. ply-ui.json (or legacy base-ui.json)
  const configPath = configFilePath(cwd);
  let config: DoctorConfig | null = null;
  if (!configPath) {
    checks.push({
      name: CONFIG_FILE,
      status: 'error',
      message: `Not found (also looked for ${LEGACY_CONFIG_FILE}). Run "${CLI_NPX} init" first.`,
    });
  } else {
    config = readJsonSafe<DoctorConfig>(configPath);
    if (!config) {
      checks.push({
        name: CONFIG_FILE,
        status: 'error',
        message: `${relative(configPath)} exists but is not valid JSON.`,
      });
    } else if (!config.aliases?.components) {
      checks.push({
        name: CONFIG_FILE,
        status: 'error',
        message: `${relative(configPath)} is missing aliases.components.`,
      });
    } else {
      checks.push({
        name: CONFIG_FILE,
        status: 'ok',
        message: `${relative(configPath)} exists and aliases.components is set.`,
      });
    }
  }

  // 2. Angular workspace
  const angularJsonPath = path.resolve(cwd, 'angular.json');
  let angularJson: any = null;
  if (!fs.existsSync(angularJsonPath)) {
    checks.push({
      name: 'Angular workspace',
      status: 'warn',
      message: 'No angular.json found. Is this an Angular workspace?',
    });
  } else {
    angularJson = readJsonSafe(angularJsonPath);
    const picked = angularJson ? pickAngularProject(angularJson) : null;
    if (!picked) {
      checks.push({
        name: 'Angular workspace',
        status: 'error',
        message: `${relative(angularJsonPath)} has no buildable project.`,
      });
    } else {
      checks.push({
        name: 'Angular workspace',
        status: 'ok',
        message: `Buildable project "${picked.name}" found.`,
      });
    }
  }

  // 3. package.json dependencies
  const packageJsonPath = path.resolve(cwd, 'package.json');
  const packageJson = readJsonSafe(packageJsonPath);
  if (!packageJson) {
    checks.push({
      name: 'package.json',
      status: 'error',
      message: `${relative(packageJsonPath)} not found or invalid.`,
    });
  } else {
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    if (!deps['@angular/cdk']) {
      checks.push({
        name: 'Angular CDK',
        status: 'error',
        message: '@angular/cdk is not installed. Most components need it for overlays.',
      });
    } else {
      checks.push({
        name: 'Angular CDK',
        status: 'ok',
        message: `@angular/cdk ${deps['@angular/cdk']} installed.`,
      });
    }
  }

  // 4. Tailwind CSS entry
  const tailwindPath = path.resolve(cwd, config?.tailwind?.config || 'src/tailwind.css');
  const tailwindContent = readTextSafe(tailwindPath);
  if (!tailwindContent) {
    checks.push({
      name: 'Tailwind entry',
      status: 'error',
      message: `${relative(tailwindPath)} not found. Set tailwind.config in ${CONFIG_FILE} or create it.`,
    });
  } else {
    checks.push({
      name: 'Tailwind entry',
      status: 'ok',
      message: `${relative(tailwindPath)} exists.`,
    });

    // 5. Tailwind v4 setup
    if (!tailwindContent.includes('@import "tailwindcss"') && !tailwindContent.includes("@import 'tailwindcss'")) {
      checks.push({
        name: 'Tailwind v4',
        status: 'warn',
        message: `${relative(tailwindPath)} does not import "tailwindcss". Tailwind v4 is required.`,
      });
    } else {
      checks.push({
        name: 'Tailwind v4',
        status: 'ok',
        message: `${relative(tailwindPath)} imports Tailwind v4.`,
      });
    }

    // 6. @source paths
    const sourceMatches = tailwindContent.match(/@source\s+["']([^"']+)["']/g) || [];
    if (!sourceMatches.length) {
      checks.push({
        name: '@source paths',
        status: 'warn',
        message: `No @source directives found in ${relative(tailwindPath)}. Components may not be scanned for classes.`,
      });
    } else {
      const componentsAlias = config?.aliases?.components || 'src/app/components';
      const componentsDir = path.resolve(cwd, componentsAlias);
      const tailwindDir = path.dirname(tailwindPath);
      const hasComponentSource = sourceMatches.some((m) => {
        const raw = m.match(/@source\s+["']([^"']+)["']/)?.[1];
        if (!raw) return false;
        return sourceCovers(raw, tailwindDir, componentsDir);
      });

      if (!hasComponentSource) {
        checks.push({
          name: '@source paths',
          status: 'warn',
          message: `@source directives exist but none point to ${componentsAlias}. Component classes may be missing.`,
        });
      } else {
        checks.push({
          name: '@source paths',
          status: 'ok',
          message: `@source covers ${componentsAlias}.`,
        });
      }
    }
  }

  // 7. Global styles and ply-ui.css
  const stylesPath = path.resolve(cwd, config?.tailwind?.css || 'src/styles.scss');
  const stylesContent = readTextSafe(stylesPath);
  if (!stylesContent) {
    checks.push({
      name: 'Global styles',
      status: 'error',
      message: `${relative(stylesPath)} not found. Set tailwind.css in ${CONFIG_FILE} or create it.`,
    });
  } else {
    const cssImports = cssImportCandidates();
    const hasCssImport = cssImports.some((line) => stylesContent.includes(line));
    if (!hasCssImport) {
      checks.push({
        name: 'Global styles',
        status: 'warn',
        message: `${relative(stylesPath)} does not import './${CSS_FILE}'. Ply global styles will be missing.`,
      });
    } else {
      checks.push({
        name: 'Global styles',
        status: 'ok',
        message: `${relative(stylesPath)} imports Ply global styles.`,
      });
    }

    const stylesDir = path.dirname(stylesPath);
    const cssPath = path.join(stylesDir, CSS_FILE);
    const legacyCssPath = path.join(stylesDir, LEGACY_CSS_FILE);
    const resolvedCss = fs.existsSync(cssPath) ? cssPath : fs.existsSync(legacyCssPath) ? legacyCssPath : null;
    if (!resolvedCss) {
      checks.push({
        name: CSS_FILE,
        status: 'error',
        message: `${relative(cssPath)} not found. Run "${CLI_NPX} init" to create it.`,
      });
    } else {
      checks.push({
        name: CSS_FILE,
        status: 'ok',
        message: `${relative(resolvedCss)} exists.`,
      });
    }
  }

  // 8. Icon sprites
  const assetsDir = angularJson ? resolveAssetsDir(cwd, angularJson) : path.resolve(cwd, 'src/assets');
  const missingSprites = ICON_SPRITES.filter((s) => !fs.existsSync(path.join(assetsDir, s)));
  if (missingSprites.length) {
    checks.push({
      name: 'Icon sprites',
      status: 'error',
      message: `Missing ${missingSprites.join(', ')} in ${relative(assetsDir)}. Run "${CLI_NPX} init" to download them.`,
    });
  } else {
    checks.push({
      name: 'Icon sprites',
      status: 'ok',
      message: `${ICON_SPRITES.join(', ')} found in ${relative(assetsDir)}.`,
    });
  }

  // 9. Components directory
  const componentsAlias = config?.aliases?.components;
  if (componentsAlias) {
    const componentsDir = path.resolve(cwd, componentsAlias);
    if (!fs.existsSync(componentsDir)) {
      checks.push({
        name: 'Components directory',
        status: 'warn',
        message: `${relative(componentsDir)} does not exist yet. It will be created when you add a component.`,
      });
    } else {
      checks.push({
        name: 'Components directory',
        status: 'ok',
        message: `${relative(componentsDir)} exists.`,
      });
    }
  }

  spinner.succeed('Check complete.');
  printReport(checks);
}

function printReport(checks: Check[]): void {
  console.log('');
  for (const check of checks) {
    const symbol = check.status === 'ok' ? '✔' : check.status === 'warn' ? '⚠' : '✖';
    console.log(`${symbol} ${check.name}: ${check.message}`);
  }

  const errors = checks.filter((c) => c.status === 'error').length;
  const warnings = checks.filter((c) => c.status === 'warn').length;
  const ok = checks.filter((c) => c.status === 'ok').length;

  console.log('');
  if (errors === 0 && warnings === 0) {
    console.log(`✔ All ${ok} checks passed. Your project is ready for Ply.`);
  } else if (errors === 0) {
    console.log(`⚠ ${ok} passed, ${warnings} warning(s). Review the warnings above.`);
  } else {
    console.log(`✖ ${ok} passed, ${warnings} warning(s), ${errors} error(s). Fix errors before adding components.`);
    console.log(`  Need help? ${SITE_URL}/getting-started/`);
    process.exitCode = 1;
  }
}
