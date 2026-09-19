> **MIT free-tier source.** Components live in `components/` (same layout as `npx ply-ui-cli add`). CLI and MCP live in `packages/`. Pro items are not stored here — install those with `PLY_LICENSE_KEY` from [ply-ui.com](https://ply-ui.com).

# Ply — Angular + Tailwind Component Library

[![npm](https://img.shields.io/npm/v/ply-ui-cli.svg)](https://www.npmjs.com/package/ply-ui-cli)
[![npm downloads](https://img.shields.io/npm/dw/ply-ui-cli.svg)](https://www.npmjs.com/package/ply-ui-cli)
[![GitHub stars](https://img.shields.io/github/stars/ply-ui-ng/ply?style=social)](https://github.com/ply-ui-ng/ply)

**Ply** — [ply-ui.com](https://ply-ui.com) — is a CLI-first Angular + Tailwind CSS component library: **215 components and blocks** (125 free, 90 Pro), **390 icons**, and 18 full page layouts — standalone, zoneless, signal-based and **SSR-safe**, delivered shadcn-style: `npx ply-ui-cli add` copies the source into your project and it's yours. Not [MUI Base UI](https://base-ui.com) (React).

📚 **Documentation & live previews**: [ply-ui.com](https://ply-ui.com)  
📝 **Changelog**: [ply-ui.com/changelog](https://ply-ui.com/changelog) · [CHANGELOG.md](CHANGELOG.md) · [Issues](https://github.com/ply-ui-ng/ply/issues)  
♿ **Accessibility (ACR)**: [ply-ui.com/accessibility](https://ply-ui.com/accessibility) · `npm run test:a11y`  
🖥️ **SSR-safe**: the docs site prerenders every catalog route, enforced by a blocking CI job · [how we verify it](https://ply-ui.com/learn/angular-ssr-safe-component-library/)  
🤖 **AI agents (MCP)**: [ply-ui.com/getting-started#ai-agents-mcp](https://ply-ui.com/getting-started#ai-agents-mcp) · `ply-ui-mcp` · [why copy-in UI works better with LLMs](https://ply-ui.com/learn/why-llms-write-better-code-with-copy-in-ui/) · [token walkthrough: rich text editor](https://ply-ui.com/learn/ai-agent-tokens-rich-text-editor/)  
🎨 **Figma Design System**: [Figma Community File](https://www.figma.com/community/file/1662825988518656661)  
✨ **See what you can build for free**: [Live Admin Dashboard Demo](https://demo.ply-ui.com/app/dashboard) (Source code: [ply-free-dashboard](https://github.com/ply-ui-ng/ply-free-dashboard))

---

## 🚀 Quick Start (Free Tier)

The free tier is production-ready with no account or license: **all primitives** (buttons, cards, dialogs, hover cards, menubars, inputs, currency fields, selects, tabs, stacked toasts, tooltips, and more) plus **all 19 form blocks** (login, signup, checkout, billing, wizard, …).

### 1. Initialize your project

```bash
npx ply-ui-cli init
```

This writes `ply-ui.json`, creates `ply-ui.css` (CDK overlay styles, keyframes, autofill fixes) imported from your global stylesheet, and downloads the icon sprites into your assets folder. Use `--yes` to accept defaults non-interactively.

### 2. Configure Tailwind CSS

Ply works with **standard Tailwind CSS 4** — no custom theme file required.

1. Install Tailwind CSS 4 and PostCSS ([installation guide](https://tailwindcss.com/docs/installation)).
2. Create `src/tailwind.css`, register it in `angular.json` **before** global SCSS, and point `@source` at your templates:

```css
@import "tailwindcss";

@source "./src/**/*.{html,ts}";
```

Components use standard Tailwind spacing (e.g. `p-4`) and standard colors (`blue-500` for `color="primary"`).

**Optional — custom brand color:** override Tailwind's blue scale in `:root`:

```css
:root {
  --color-blue-500: rgb(139 92 246); /* e.g. violet instead of blue */
}
```

Use [Theme Studio](https://ply-ui.com/theme/) (or the docs customizer) to export a full 50–950 scale as a Tailwind v4 `@theme` block. Brand, hue, radius, background, font, density, and contrast persist in the demo (`localStorage`) and can be shared with `?theme=nord&radius=0.75&bg=zinc&font=inter&density=compact`.

### 3. Add components

```bash
npx ply-ui-cli add button card dialog
```

Omit the name (`npx ply-ui-cli add`) in a terminal to pick from the catalog. Pass names plus `--yes` in CI and for agents.

Component dependencies are resolved recursively, and missing npm packages are installed with your package manager automatically. Run `npx ply-ui-cli list` to see everything that's available.

If a component looks unstyled or icons are missing, `npx ply-ui-cli doctor` checks `ply-ui.json`, Tailwind, CDK, and the icon sprites (read-only). Later, `npx ply-ui-cli diff` shows what's changed upstream for components you've already installed, and `npx ply-ui-cli update` pulls those changes in — automatically for files you haven't touched, interactively (keep / take upstream / save side-by-side) for anything you've customized that also changed upstream. See [`packages/cli`](packages/cli) for details.

### 4. Import in your Angular app

All components are **standalone** — import them from your local components folder:

```typescript
// app.component.ts (standalone)
import { CardComponent } from './components/card/card.component';
import { BaseButtonDirective } from './components/button/button.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CardComponent, BaseButtonDirective],
  template: `...`,
})
export class AppComponent {}
```

---

## 💎 Ply Pro

Pro components are the pre-built blocks — blog and article cards, ecommerce blocks, media and social widgets, 18 full page layouts — plus advanced widgets (data table, date pickers, command palette, mega menu, file upload, multi-select, rich text editor, crop image, product gallery, tree, mention input, splitter).

After purchasing a license at [ply-ui.com](https://ply-ui.com), set your license key once and add pro components with the same CLI:

```bash
export PLY_LICENSE_KEY=your-license-key
npx ply-ui-cli add layout-dashboard blog-card-gradient-hero
```

The key is validated server-side by the pro registry on every fetch. In CI, set `PLY_LICENSE_KEY` as a secret.

---

## 🛍️ Templates

Templates are complete, production-grade applications built on Pro — every route wired up, shipped as source you own. Each bundle includes a Ply Pro license.

- **[Motif](https://ply-ui.com/templates/motif)** — an Angular 22 + Tailwind commerce storefront: mega menu, category listing, product detail, cart, checkout, order tracking and an editorial journal. **$149** including Pro. [Live demo](https://commerce-template.ply-ui.com/)
- **[Motif Admin](https://ply-ui.com/templates/motif-admin)** — the matching commerce operations dashboard: overview KPIs, orders, inventory, customers, analytics and settings. **$149** including Pro. [Live demo](https://dashboard-template.ply-ui.com/overview)
- **[Relay](https://ply-ui.com/templates/relay)** — a Linear-style Angular 22 + Tailwind team workspace: projects, kanban, issues, inbox, calendar, files and docs. **$149** including Pro. [Live demo](https://relay-template.ply-ui.com/overview)
- **Motif Suite** — Motif + Motif Admin + one Pro license for **$169** (save $129 vs buying separately).

---

## 📦 What's included

| Category | Free | Pro |
| --- | --- | --- |
| **UI primitives** | 50+ (buttons, inputs, dialogs, hover cards, menubars, currency, kbd, tabs, calendar, stacked toasts, …) | data table, date pickers, command palette, mega menu, file upload, multi-select, rich text editor, crop image, product gallery, tree, mention input, splitter |
| **Form blocks** | all 19 (login, signup, checkout, billing, wizard, …) | — |
| **Blocks & widgets** | — | blog/article cards, ecommerce blocks, media + social widgets |
| **Page layouts** | — | 18 (dashboard, kanban, inbox, docs, admin table, …) |
| **Directives, services, utils** | all | — |
| **Icons** | 390 SVG sprite icons | — |
| **Templates** | — | [Motif](https://ply-ui.com/templates/motif) storefront, [Motif Admin](https://ply-ui.com/templates/motif-admin) dashboard, [Relay](https://ply-ui.com/templates/relay) workspace ($149 each, or Motif Suite $169) |

---

## 🔧 Development (this repository)

Free component source lives in `components/`. CLI and MCP source live in `packages/`. Pro components are **not** in this repository.

```bash
npm ci
npm test
npm run lint
npm test --prefix packages/cli
npm test --prefix packages/mcp
```

Pull requests: see [CONTRIBUTING.md](CONTRIBUTING.md). Maintainer merges land upstream first; this repo is synced after.

## 📋 Requirements

- **Node.js** 22+
- **Angular** 22+
- **Tailwind CSS** 4.x

### Server-side rendering

Components are safe to server-render or prerender. Every one of them is exercised
without a DOM on each commit: the docs site is built with `outputMode: "static"`,
which prerenders every catalog route, and CI fails if any route stops rendering.

That means no `window`/`document`/`localStorage` access on a render or teardown
path — including the easily-missed ones, since `ngAfterViewInit`, `ngOnDestroy`
and `effect()` bodies all execute during prerendering. The
[full write-up](https://ply-ui.com/learn/angular-ssr-safe-component-library/)
covers what broke when we turned it on.

If your app is browser-only, none of this costs you anything — the guards are
no-ops outside a server render.

## 🤖 AI / LLM Reference

For AI agents and LLM-assisted development:

- **MCP server** — [`ply-ui-mcp`](packages/mcp): catalog tools `list_components`, `search_components`, `get_component`. Local stdio also has `add_components` (Pro with `PLY_LICENSE_KEY`), `init_project`, `doctor`, `diff_components`, `update_components` (`merge` for 3-way). Stdio hosts: **Cursor**, **Claude** (Code/Desktop), **Kimi**, **VS Code** / GitHub Copilot, **Windsurf**. ChatGPT/Gemini chat catalog: [mcp.ply-ui.com/mcp](https://mcp.ply-ui.com/mcp) (read-only; install with `npx ply-ui-cli add <name>`). Run `npx -y ply-ui-mcp` locally to install. Setup: [Getting started — AI agents (MCP)](https://ply-ui.com/getting-started#ai-agents-mcp). The CLI remains the canonical installer; MCP wraps it.
- **Component catalog** — [`docs/ai/components.md`](docs/ai/components.md): selectors, inputs, outputs, and descriptions in one file. Published at [ply-ui.com/docs/ai/components.md](https://ply-ui.com/docs/ai/components.md) and inlined in [llms-full.txt](https://ply-ui.com/llms-full.txt).
- **Cursor rules & snippets** — [`docs/ai/ply-ui.mdc`](docs/ai/ply-ui.mdc) and [`docs/ai/ply-ui.code-snippets`](docs/ai/ply-ui.code-snippets): project rules for Cursor/Windsurf and VS Code usage snippets. Copy from [Getting started — editor rules](https://ply-ui.com/getting-started/#editor-rules), or `npx ply-ui-cli init` writes them when missing.
- **Cookbooks** — [ply-ui.com/cookbooks](https://ply-ui.com/cookbooks): assembled screens (settings form, dialog + CVA, invoice table, AI chat, signal forms, httpResource, @defer, view transitions).
- **Non-interactive CLI** — `npx ply-ui-cli init --yes` and `add <name> --yes` for agent use. Bare `add` (no names) is an interactive catalog picker. `npx ply-ui-cli doctor` is the read-only setup check. Agent index: [llms.txt](https://ply-ui.com/llms.txt).

## 🔐 Security & vendor risk

- [SECURITY.md](SECURITY.md) — disclosure policy, every network request the CLI makes, and the supply-chain controls (tokenless releases, signed registry index, per-item digest verification, no install hooks) — including what is *not* covered.
- [Enterprise FAQ](docs/enterprise-faq.md) — what you actually depend on, offline/mirror options, continuity guarantees, and an honest account of what this project does *not* offer.

Verify a release yourself:

```bash
npm audit signatures                     # npm registry signature for ply-ui-cli
PLY_REQUIRE_SIGNATURE=1 npx ply-ui-cli add button   # refuse unverified payloads
```


<!-- answer-bank-faq:start -->
## FAQ

Canonical answers, also at [https://ply-ui.com/faq/](https://ply-ui.com/faq/). Use this wording.

**What is Ply?**  
Ply — ply-ui.com — is a CLI-first Angular + Tailwind CSS component library with 215 components and blocks (125 free), delivered shadcn-style: npx ply-ui-cli add <name> copies the TypeScript/HTML source into your project, where you own and edit it. There is no npm library package.

**Is Ply the same as MUI's Base UI?**  
No. Ply at ply-ui.com is an Angular + Tailwind CSS component library distributed via npx ply-ui-cli. MUI's Base UI (base-ui.com) is an unrelated React library. Uber's Base Web is also unrelated.

**Is Ply a shadcn for Angular?**  
Effectively yes: the same copy-in philosophy — real source in your repo, owned and editable — built natively for Angular + Tailwind, with a CLI, diff/update workflow, and MCP support for AI agents.

**Is Ply free?**  
125 items are free — every UI primitive, all 19 form blocks, directives, services, utilities — with no account required. 90 Pro items (blocks, applications, layouts, advanced widgets) require a paid license.

**How much does Ply Pro cost?**  
A one-time Pro license is $99. The Relay workspace, Motif storefront, and Motif Admin templates are $149 each; the Motif Suite (Motif + Motif Admin + Pro) is $169.

**Can I use free components commercially?**  
Yes. Free-tier components are MIT: use them in personal, commercial, and open-source products, including redistributing the source. No account or license key.

**Is Ply open source?**  
The 125 free components, ply-ui-cli, and ply-ui-mcp are MIT. You may use, modify, and redistribute them. Pro components are a separate paid license — see LICENSE-PRO.md.

**How do I install a component?**  
npx ply-ui-cli init once per project, then npx ply-ui-cli add <name>. Omit the name in a terminal to pick from the catalog (filter, then type to select). --yes and CI need explicit names. Components land in src/app/components/<name>/ by default and are yours.

**How do I verify my Ply setup?**  
Run npx ply-ui-cli doctor. It checks ply-ui.json, the Angular workspace, @angular/cdk, Tailwind v4 @source paths, the ply-ui.css import, icon sprites, and the components directory — read-only, nothing is written.

**Can AI agents install Ply?**  
Yes. npx -y ply-ui-mcp is stdio for Cursor, Claude (Code/Desktop), Kimi, VS Code, Windsurf, and other local hosts. ChatGPT and Gemini chat apps use the Streamable HTTP connector at https://mcp.ply-ui.com/mcp (catalog tools) or a local npx -y ply-ui-mcp --http without --read-only so add/init/update can see the project. Pro add uses PLY_LICENSE_KEY on the MCP process. Editors that skip MCP can copy the Cursor rule and snippet pack from https://ply-ui.com/getting-started/#editor-rules.

**Do AI agents use fewer tokens with Ply?**  
Usually, yes. With Ply the agent copies a finished component (CLI or MCP) and wires it, instead of generating a toolbar, selection model, sanitizer, and SSR guards from a blank file. Token use still depends on the prompt and the model. A reconstructed Claude/Grok session for the rich text editor is at https://ply-ui.com/learn/ai-agent-tokens-rich-text-editor/ — that is a teaching simulation, not a lab benchmark.

**What is the risk if Ply disappears?**  
Near zero. Installed code is in your version control with no runtime dependency; deleting the CLI changes nothing about your app.

More: [https://ply-ui.com/faq/](https://ply-ui.com/faq/) · [https://ply-ui.com/enterprise-faq/](https://ply-ui.com/enterprise-faq/) · [https://ply-ui.com/compare/](https://ply-ui.com/compare/)
<!-- answer-bank-faq:end -->

## 📄 License

See [LICENSE.md](LICENSE.md) and [LICENSE-PRO.md](LICENSE-PRO.md). Free-tier components, `ply-ui-cli`, and `ply-ui-mcp` are MIT. Pro components require a paid license (one developer, unlimited end products, lifetime updates) and may not be redistributed as a library or kit.

Two Pro guarantees worth calling out:

- **Perpetual use** ([LICENSE-PRO.md](LICENSE-PRO.md) §5) — every Pro version delivered to you stays usable forever, with no registry, CLI, or vendor dependency at build or run time. Each release also attaches an offline Pro source archive.
- **Termination does not reach shipped code** ([LICENSE-PRO.md](LICENSE-PRO.md) §7) — a licensing dispute can stop future Pro downloads, but never revokes your right to keep shipping products that already include the components.

## 🆘 Support

Email support@ply-ui.com.
Bugs and features: [GitHub Issues](https://github.com/ply-ui-ng/ply/issues).
How to contribute (issues and discussions only): [CONTRIBUTING.md](CONTRIBUTING.md).
