import fs from 'fs';
import path from 'path';
import { ora, prompts } from '../vendor';
import { SITE_URL } from '../registry';
import { LOCKFILE_NAME, readLockFile, writeLockFile } from '../lockfile';
import { CODE_SNIPPETS, CURSOR_RULE } from '../templates/editor-kit.generated';
import { CLI_NPX } from '../brand';
import {
  CONFIG_FILE,
  CSS_FILE,
  CURSOR_RULE_REL,
  DOCS_CURSOR_RULE,
  DOCS_SNIPPETS,
  LEGACY_CSS_FILE,
  SNIPPETS_REL,
} from '../paths';

/**
 * Global styles Ply components rely on. Written into the user's project
 * (no npm package required — components are copied in, so their global CSS
 * has to live in the project too).
 */
const BASE_CSS = `/* Ply global styles — ${SITE_URL} */

/* Overlay positioning for dialogs, dropdowns and tooltips (Angular CDK). */
@import '@angular/cdk/overlay-prebuilt.css';

/*
 * Semantic tokens. Buttons, inputs, and Theme Studio read these.
 * Override in :root (or paste a Theme Studio export) — do not fork components
 * just to change brand color.
 */
:root {
  --ply-background: #ffffff;
  --ply-foreground: #0f172a;
  --ply-primary: #2563eb;
  --ply-primary-hover: #1d4ed8;
  --ply-primary-active: #1e40af;
  --ply-primary-foreground: #ffffff;
  --ply-muted: #e2e8f0;
  --ply-muted-foreground: #334155;
  --ply-destructive: #dc2626;
  --ply-destructive-hover: #b91c1c;
  --ply-destructive-foreground: #ffffff;
  --ply-border: #cbd5e1;
  --ply-ring: #2563eb;
  --ply-radius: 0.5rem;
  --radius: var(--ply-radius);
  /* Compat for components copied before the Ply rename. */
  --base-background: var(--ply-background);
  --base-foreground: var(--ply-foreground);
  --base-primary: var(--ply-primary);
  --base-primary-hover: var(--ply-primary-hover);
  --base-primary-active: var(--ply-primary-active);
  --base-primary-foreground: var(--ply-primary-foreground);
  --base-muted: var(--ply-muted);
  --base-muted-foreground: var(--ply-muted-foreground);
  --base-destructive: var(--ply-destructive);
  --base-destructive-hover: var(--ply-destructive-hover);
  --base-destructive-foreground: var(--ply-destructive-foreground);
  --base-border: var(--ply-border);
  --base-ring: var(--ply-ring);
  --base-radius: var(--ply-radius);
}

.dark {
  --ply-background: #0f172a;
  --ply-foreground: #f8fafc;
  --ply-muted: #1e293b;
  --ply-muted-foreground: #e2e8f0;
  --ply-border: #334155;
  --ply-primary-foreground: #ffffff;
  --ply-destructive-foreground: #ffffff;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out forwards;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s linear infinite;
}

/* Chrome autofill fix for dark mode */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-background-clip: text;
  -webkit-text-fill-color: #334155 !important; /* slate-700 */
  transition: background-color 5000s ease-in-out 0s;
  box-shadow: inset 0 0 20px 20px #ffffff;
}

.dark input:-webkit-autofill,
.dark input:-webkit-autofill:hover,
.dark input:-webkit-autofill:focus,
.dark input:-webkit-autofill:active {
  -webkit-text-fill-color: #e2e8f0 !important; /* slate-200 */
  -webkit-box-shadow: 0 0 0px 1000px #1e293b inset !important; /* slate-800 */
}

/* Hide the datalist arrow in Chrome; leave native date/time pickers visible. */
input[list]::-webkit-calendar-picker-indicator {
  display: none !important;
}
`;

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

async function downloadSprite(name: string, targetDir: string): Promise<boolean> {
  try {
    const res = await fetch(`${SITE_URL}/assets/${name}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, name), body);
    return true;
  } catch (err: any) {
    console.warn(`\n⚠ Could not download ${name} (${err.message}). Download it manually from ${SITE_URL}/assets/${name} into ${targetDir}.`);
    return false;
  }
}

function writeEditorFile(dest: string, content: string, label: string): void {
  if (fs.existsSync(dest)) return;
  try {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content, 'utf8');
  } catch (err: any) {
    console.warn(
      `\n⚠ Could not write ${label} (${err.message}). Copy it from ${SITE_URL}/${label.endsWith('.code-snippets') ? DOCS_SNIPPETS : DOCS_CURSOR_RULE}.`,
    );
  }
}

export interface InitOptions {
  yes?: boolean;
}

const INIT_DEFAULTS = {
  componentsAlias: 'src/app/components',
  styles: 'src/styles.scss',
  tailwind: 'src/tailwind.css',
};

export async function init(options: InitOptions = {}) {
  const response = options.yes
    ? { ...INIT_DEFAULTS }
    : await prompts([
        {
          type: 'text',
          name: 'componentsAlias',
          message: 'Configure the import alias for components:',
          initial: INIT_DEFAULTS.componentsAlias,
        },
        {
          type: 'text',
          name: 'styles',
          message: 'Where is your global CSS file?',
          initial: INIT_DEFAULTS.styles,
        },
        {
          type: 'text',
          name: 'tailwind',
          message: 'Path to your Tailwind CSS entry file:',
          initial: INIT_DEFAULTS.tailwind,
        }
      ]);

  if (!response.componentsAlias) {
    console.log('Initialization cancelled.');
    return;
  }

  const spinner = ora(`Writing ${CONFIG_FILE}...`).start();
  const configPath = path.resolve(process.cwd(), CONFIG_FILE);

  const config = {
    $schema: 'https://ply-ui.com/schema.json',
    style: 'scss',
    tailwind: {
      config: response.tailwind,
      css: response.styles,
      baseColor: 'slate',
      cssVariables: true,
    },
    aliases: {
      components: response.componentsAlias,
      utils: 'src/app/utils',
    }
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

  // ─── Lockfile ─────────────────────────────────────────────────
  // Tracks per-file content hashes for installed components so `diff`/
  // `update` can later tell "you edited this" apart from "upstream changed
  // this". Never overwrite an existing one — re-running init on an
  // already-set-up project shouldn't lose installed-component history.
  const lockPath = path.resolve(process.cwd(), LOCKFILE_NAME);
  if (!fs.existsSync(lockPath)) {
    writeLockFile(readLockFile());
  }

  // ─── Global styles ────────────────────────────────────────────
  // Write ply-ui.css next to the user's global stylesheet and import it.
  spinner.text = 'Writing global styles...';
  const stylesPath = path.resolve(process.cwd(), response.styles);
  const stylesDir = path.dirname(stylesPath);
  const cssPath = path.join(stylesDir, CSS_FILE);
  const importLine = `@import './${CSS_FILE}';`;
  const legacyImport = `@import './${LEGACY_CSS_FILE}';`;
  try {
    fs.mkdirSync(stylesDir, { recursive: true });
    fs.writeFileSync(cssPath, BASE_CSS, 'utf8');
    if (fs.existsSync(stylesPath)) {
      let stylesContent = fs.readFileSync(stylesPath, 'utf8');
      if (stylesContent.includes(legacyImport) && !stylesContent.includes(importLine)) {
        stylesContent = stylesContent.replace(legacyImport, importLine);
        fs.writeFileSync(stylesPath, stylesContent, 'utf8');
      } else if (!stylesContent.includes(importLine)) {
        fs.writeFileSync(stylesPath, `${importLine}\n${stylesContent}`, 'utf8');
      }
    } else {
      fs.writeFileSync(stylesPath, `${importLine}\n`, 'utf8');
      console.warn(`\n⚠ ${response.styles} did not exist — created it. Make sure it is listed in the "styles" array of angular.json.`);
    }
  } catch (error: any) {
    console.warn(`\n⚠ Could not update global styles (${error.message}). Add "${importLine}" to ${response.styles} manually and create ${CSS_FILE} next to it.`);
  }

  // ─── Icon sprites ─────────────────────────────────────────────
  // The icon component loads /assets/icons.svg and /assets/icons-filled.svg
  // at runtime, so the sprites are downloaded into the project's assets.
  spinner.text = 'Setting up icon sprites...';
  let assetsDir = path.resolve(process.cwd(), 'src/assets');
  try {
    const angularJsonPath = path.resolve(process.cwd(), 'angular.json');
    if (fs.existsSync(angularJsonPath)) {
      const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
      const picked = pickAngularProject(angularJson);
      const buildOptions = picked?.project?.architect?.build?.options;
      if (buildOptions) {
        const assets: any[] = buildOptions.assets || [];
        const hasSrcAssets = assets.some(
          (a) => a === 'src/assets' || (typeof a === 'object' && a?.input === 'src/assets')
        );
        const publicEntry = assets.find(
          (a) => a === 'public' || (typeof a === 'object' && a?.input === 'public')
        );
        if (hasSrcAssets) {
          assetsDir = path.resolve(process.cwd(), 'src/assets');
        } else if (publicEntry) {
          // Default Angular 18+ layout: everything in public/ is served from /.
          assetsDir = path.resolve(process.cwd(), 'public/assets');
        } else {
          assetsDir = path.resolve(process.cwd(), 'src/assets');
          for (const sprite of ICON_SPRITES) {
            const exists = assets.some(
              (a) => typeof a === 'object' && a?.glob === sprite && a?.input === 'src/assets'
            );
            if (!exists) {
              assets.push({ glob: sprite, input: 'src/assets', output: '/assets' });
            }
          }
          buildOptions.assets = assets;
          fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2), 'utf8');
        }
      } else {
        console.warn(`\n⚠ Could not find build options in angular.json — serve the icon sprites at /assets/icons.svg and /assets/icons-filled.svg yourself.`);
      }
    } else {
      console.warn('\n⚠ No angular.json found — is this an Angular workspace? Continuing anyway.');
    }
  } catch (error: any) {
    console.warn(`\n⚠ Could not update angular.json (${error.message}). Make sure the icon sprites are served at /assets/icons.svg and /assets/icons-filled.svg.`);
  }

  spinner.text = 'Downloading icon sprites...';
  for (const sprite of ICON_SPRITES) {
    await downloadSprite(sprite, assetsDir);
  }

  spinner.text = 'Writing editor rules and snippets...';
  writeEditorFile(
    path.resolve(process.cwd(), CURSOR_RULE_REL),
    CURSOR_RULE,
    CURSOR_RULE_REL,
  );
  writeEditorFile(
    path.resolve(process.cwd(), SNIPPETS_REL),
    CODE_SNIPPETS,
    SNIPPETS_REL,
  );

  spinner.succeed(`Project initialized! Add your first component with "${CLI_NPX} add button".`);
}
