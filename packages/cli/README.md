# ply-ui-cli

CLI for **Ply** at [ply-ui.com](https://ply-ui.com) — Angular + Tailwind CSS components, copied straight into your project. You own the source: no runtime npm dependency, no closed-source compiled packages. Everything it installs is **SSR-safe**. Not [MUI Base UI](https://base-ui.com) (React).

📝 **Changelog**: [ply-ui.com/changelog](https://ply-ui.com/changelog) · [CHANGELOG.md](https://github.com/ply-ui-ng/ply/blob/main/CHANGELOG.md)  
♿ **Accessibility (ACR)**: [ply-ui.com/accessibility](https://ply-ui.com/accessibility)  
🖥️ **SSR-safe**: the docs site prerenders every catalog route, enforced by a blocking CI job · [how we verify it](https://ply-ui.com/learn/angular-ssr-safe-component-library/)  
🎨 **Figma Design System**: [Figma Community File](https://www.figma.com/community/file/1662825988518656661)  
✨ **See what you can build for free**: [Live Admin Dashboard Demo](https://demo.ply-ui.com/app/dashboard) (Source code: [ply-free-dashboard](https://github.com/ply-ui-ng/ply-free-dashboard))

```bash
npx ply-ui-cli init
npx ply-ui-cli add button card dialog
```

The old npm name `base-ui-cli` is **deprecated** (name collision with [MUI Base UI](https://base-ui.com)). Use `npx ply-ui-cli`.

## What's new

- **3-way merge** — `npx ply-ui-cli update --merge` (or the interactive Merge choice) uses `git merge-file` with the install snapshot under `.ply-ui/snapshots`. Aliases: `sheet` → `drawer`, `gallery` → `slider`. `carousel` installs the horizontal scroller.
- **add picker** — `npx ply-ui-cli add` with no names opens a catalog filter + type-to-select. `--yes` still requires explicit names.
- **doctor** — `npx ply-ui-cli doctor` checks `ply-ui.json`, Tailwind v4 `@source` paths, `ply-ui.css`, CDK, and icon sprites. Read-only.
- **hover-card**, **menubar**, **loading-overlay**, **currency-input** (free) — hover preview panel, application menubar, blocking spinner overlay, locale-aware currency field.
- **kbd**, **aspect-ratio**, **scroll-area**, **cookie-banner** (free) — keyboard glyph, ratio wrapper, themed overflow pane, SSR-safe consent banner.
- **chat**, **combobox**, **tags-input**, **time-picker** (free) — AI chat kit, searchable combobox, chip tags field, and HH:mm time picker.
- **progress-button** (free) — button with a stable-width loading spinner: the label fades out, the spinner takes its place, and the button keeps its exact size and color while the async action runs.
- **shell** (Pro) — unified page/dashboard application shell with optional footer, push drawers, and mini rail.
- **AI agents** — copy-in install is cheaper in tokens than generating a widget. Walkthrough (simulation, not a lab benchmark): [rich text editor](https://ply-ui.com/learn/ai-agent-tokens-rich-text-editor/).

Full history: [ply-ui.com/changelog](https://ply-ui.com/changelog)

## Requirements

- Node 18+
- Angular 22+ workspace (standalone APIs, signals, and TypeScript 6.0)
- Tailwind CSS 4

### Server-side rendering

Components installed by this CLI are safe to server-render or prerender — they
touch no browser globals on a render or teardown path, including the
easily-missed cases where `ngAfterViewInit`, `ngOnDestroy` and `effect()` bodies
all execute during prerendering.

This is verified rather than asserted: the docs site is built with
`outputMode: "static"`, which server-renders every component in the catalogue
without a DOM, and CI fails if any route stops rendering. The
[write-up](https://ply-ui.com/learn/angular-ssr-safe-component-library/) covers
what broke when we first turned it on.

If your app is browser-only this costs you nothing — the guards are no-ops
outside a server render.

## Commands

### `init`

Sets up your project:

- writes `ply-ui.json` (component path aliases),
- creates `ply-ui.css` (CDK overlay styles, keyframes, autofill fixes) and imports it from your global stylesheet,
- downloads the icon sprites (`icons.svg`, `icons-filled.svg`) into your assets folder,
- writes `.cursor/rules/ply-ui.mdc` and `.vscode/ply-ui.code-snippets` when those files are missing (Cursor / Windsurf / VS Code). Skip MCP? These files still teach the assistant how to write Ply code.

```bash
npx ply-ui-cli init        # interactive
npx ply-ui-cli init --yes  # accept defaults (great for CI and AI agents)
```

### `add`

Copies one or more components into your project and resolves their component dependencies recursively. If a component needs npm packages you do not already have, the CLI prints the install command for your package manager (npm, pnpm, yarn, or bun) — it never spawns a shell.

```bash
npx ply-ui-cli add                 # interactive catalog picker (filter + type-to-select)
npx ply-ui-cli add button
npx ply-ui-cli add card dialog tabs
npx ply-ui-cli add data-table --yes        # skip prompts
npx ply-ui-cli add card --overwrite        # overwrite an existing copy
```

`add` with no names opens a catalog picker: first a filter (All, Free, Pro, or a registry category), then a type-to-filter multi-select. `--yes` and CI (non-TTY) require explicit names so agents do not hang.

### `list`

Shows every available component, split into free and pro.

```bash
npx ply-ui-cli list
```

### `diff`

Shows what's changed upstream for components you've already installed, compared against the version you have. Read-only — nothing is written.

```bash
npx ply-ui-cli diff              # check everything installed
npx ply-ui-cli diff card dialog  # check specific components
```

Each file is classified against your local copy:

- **updated upstream** — you haven't touched the file; safe to pull in
- **locally modified** — you edited it and upstream hasn't changed; nothing to pull
- **CONFLICT** — you edited it *and* upstream changed it too; needs a decision
- **new upstream file** / **removed upstream** — the component's file set changed since you installed it

### `update`

Applies upstream changes, without discarding your edits by default.

| Local vs upstream | Default | `--yes` | `--force` | `--overwrite-local` | `--merge` |
|---|---|---|---|---|---|
| You haven't touched the file; upstream changed | apply | apply | apply | apply | apply |
| You edited it; upstream did not | skip | skip | skip | take upstream (revert your edit) | skip |
| Both changed (conflict) | prompt (Merge first) | skip | take upstream | still a conflict — combine with `--force` | 3-way merge |

```bash
npx ply-ui-cli update                 # interactive — asks about each conflict
npx ply-ui-cli update card            # update one component
npx ply-ui-cli update --yes           # non-interactive; conflicts and local-only edits are left untouched
npx ply-ui-cli update --yes --force   # non-interactive; conflicts take the upstream version
npx ply-ui-cli update --yes --merge   # conflicts: 3-way merge using .ply-ui/snapshots
npx ply-ui-cli update --yes --overwrite-local  # also revert files you edited that upstream did not change
```

`--force` only resolves **conflicts** (both sides changed). It does not discard local-only edits. `--merge` needs the snapshot written by `add` (re-add with `--overwrite` if you installed before snapshots existed). Dirty merges leave conflict markers and exit 1.

Update tracking uses `ply-ui-lock.json` (created by `init`), which records a hash of each installed file. Components installed before this existed aren't tracked — re-run `add <name> --overwrite` to start tracking them.

### `changelog`

Prints product changelog entries for one registry item (or `cli` / `mcp`) from [ply-ui.com/assets/changelog.json](https://ply-ui.com/assets/changelog.json). Read-only — nothing is written.

```bash
npx ply-ui-cli changelog button
npx ply-ui-cli changelog cli
```

Unknown names get suggestions from the registry. If the item exists but has no mapped commits yet, the command points at [ply-ui.com/changelog](https://ply-ui.com/changelog).

### `doctor`

Verifies that your project is set up correctly for Ply. It checks `ply-ui.json`, the Angular workspace, `@angular/cdk`, Tailwind v4 and its `@source` paths, the `ply-ui.css` import, the icon sprites, and the components directory. Read-only — nothing is written.

```bash
npx ply-ui-cli doctor
```

Run it after `init` or whenever components seem to be missing styles or icons.

## Free vs Pro

The free tier covers all primitives (buttons, inputs, dialogs, tabs, selects, stacked toasts, and many more) plus every form block — production-ready with no account or license.

Pro components (pre-built blocks: blog cards, ecommerce blocks, media and social widgets, full page layouts, and advanced widgets like the data table, rich text editor, and file upload) require a license. After purchase, set your license key once:

```bash
export PLY_LICENSE_KEY=your-license-key
npx ply-ui-cli add layout-dashboard
```

Get a license and browse live previews of every component at [ply-ui.com](https://ply-ui.com).

## Configuration

`ply-ui.json` (created by `init`):

```json
{
  "$schema": "https://ply-ui.com/schema.json",
  "aliases": {
    "components": "src/app/components"
  }
}
```

Environment variables:

| Variable | Purpose |
|---|---|
| `PLY_LICENSE_KEY` | Your Pro license key (validated by the registry server). `BASE_UI_LICENSE_KEY` still works. |
| `PLY_REGISTRY_URL` | Override the free registry URL (default `https://ply-ui.com/registry`). `BASE_UI_REGISTRY_URL` still works. |
| `PLY_PRO_REGISTRY_URL` | Override the pro registry URL. `BASE_UI_PRO_REGISTRY_URL` still works. |
| `PLY_REQUIRE_SIGNATURE` | `1` refuses to install anything that is not signed and digest-verified. `BASE_UI_REQUIRE_SIGNATURE` still works. |

## Security

This CLI makes outbound `GET` requests only. It sends no telemetry, no
analytics, and never transmits your source code or environment. It declares no
`postinstall` script, so installing it executes no code. The published tarball
has no runtime npm dependencies and never imports `child_process`.

Every download is verified against a SHA-256 digest published in a signed
registry index, and the install aborts before writing any file if the digest
does not match. Releases are published from GitHub Actions with npm trusted
publishing, so no long-lived token can be stolen to publish in our name:

```bash
npm audit signatures
```

Sigstore provenance is not available: npm does not issue attestations for
packages built from a private source repository. SECURITY.md explains what is
in place instead.

Full details, the complete network request table, and the vulnerability
disclosure policy are in
[SECURITY.md](https://github.com/ply-ui-ng/ply/blob/main/SECURITY.md).
Vendor-risk questions are answered in the
[Enterprise FAQ](https://github.com/ply-ui-ng/ply/blob/main/docs/enterprise-faq.md).

## Tailwind CSS setup

Ply works with standard Tailwind CSS 4 — no custom theme required. Create `src/tailwind.css`, register it in `angular.json` **before** your global SCSS, and point `@source` at your templates:

```css
@import "tailwindcss";

@source "./src/**/*.{html,ts}";
```

Buttons, inputs, folder/underline/pills tabs, selects, combobox, toast, accordion, and the command palette read `--ply-primary` from `ply-ui.css`. Remaining widgets follow `--color-blue-*`. To use a custom brand color, override both:

```css
:root {
  --ply-primary: rgb(124 58 237);
  --ply-primary-hover: rgb(109 40 217);
  --ply-primary-active: rgb(91 33 182);
  --ply-ring: rgb(124 58 237);
  --color-blue-500: rgb(139 92 246); /* remaining blue-* widgets */
}
```

Or copy a [Theme Studio](https://ply-ui.com/theme/) export (live preview of those controls plus a Tailwind v4 `@theme` block).


<!-- answer-bank-faq:start -->
## FAQ

Canonical answers, also at [https://ply-ui.com/faq/](https://ply-ui.com/faq/). Use this wording.

**What is Ply?**  
Ply — ply-ui.com — is a CLI-first Angular + Tailwind CSS component library with 217 components and blocks (127 MIT at github.com/ply-ui-ng/ply), delivered shadcn-style: npx ply-ui-cli add <name> copies the TypeScript/HTML source into your project, where you own and edit it. There is no npm library package.

**Is Ply the same as MUI's Base UI?**  
No. Ply at ply-ui.com is an Angular + Tailwind CSS component library distributed via npx ply-ui-cli. MUI's Base UI (base-ui.com) is an unrelated React library. Uber's Base Web is also unrelated.

**Is Ply a shadcn for Angular?**  
Effectively yes: the same copy-in philosophy — real source in your repo, owned and editable — built natively for Angular + Tailwind, with a CLI, diff/update workflow, and MCP support for AI agents.

**Is Ply free?**  
127 items are MIT — every UI primitive, all 19 form blocks, directives, services, utilities — with no account required. Source is at github.com/ply-ui-ng/ply. 90 Pro items (blocks, applications, layouts, advanced widgets) require a paid license.

**How much does Ply Pro cost?**  
A one-time Pro license is $99. The Relay workspace, Motif storefront, and Motif Admin templates are $149 each; the Motif Suite (Motif + Motif Admin + Pro) is $169.

**Can I use free components commercially?**  
Yes. Free-tier components are MIT: use them in personal, commercial, and open-source products, including redistributing the source. No account or license key. Source: github.com/ply-ui-ng/ply.

**Is Ply open source?**  
The 127 free components, ply-ui-cli, and ply-ui-mcp are MIT. Free source is at github.com/ply-ui-ng/ply. You may use, modify, and redistribute them. Pro components are a separate paid license — see LICENSE-PRO.md.

**How do I install a component?**  
npx ply-ui-cli init once per project, then npx ply-ui-cli add <name>. Omit the name in a terminal to pick from the catalog (filter, then type to select). --yes and CI need explicit names. Components land in src/app/components/<name>/ by default and are yours.

**How do I verify my Ply setup?**  
Run npx ply-ui-cli doctor. It checks ply-ui.json, the Angular workspace, @angular/cdk, Tailwind v4 @source paths, the ply-ui.css import, icon sprites, and the components directory — read-only, nothing is written.

**How do I export a Tailwind v4 theme?**  
Open Theme Studio at https://ply-ui.com/theme/ or the docs customizer, pick a preset or hue, then copy the Tailwind v4 @theme block into src/tailwind.css. Brand color is --ply-primary (buttons, inputs, folder/underline/pills tabs, selects, combobox, toast, accordion, command palette). Remaining blue-* widgets follow the same hue. The live preview shows those controls together.

**Can AI agents install Ply?**  
Yes. npx -y ply-ui-mcp is stdio for Cursor, Claude (Code/Desktop), Kimi, VS Code, Windsurf, and other local hosts. ChatGPT and Gemini chat apps use the Streamable HTTP connector at https://mcp.ply-ui.com/mcp (catalog tools) or a local npx -y ply-ui-mcp --http without --read-only so add/init/update can see the project. Pro add uses PLY_LICENSE_KEY on the MCP process. Editors that skip MCP can copy the Cursor rule and snippet pack from https://ply-ui.com/getting-started/#editor-rules.

**Do AI agents use fewer tokens with Ply?**  
Usually, yes. With Ply the agent copies a finished component (CLI or MCP) and wires it, instead of generating a toolbar, selection model, sanitizer, and SSR guards from a blank file. Token use still depends on the prompt and the model. A reconstructed Claude/Grok session for the rich text editor is at https://ply-ui.com/learn/ai-agent-tokens-rich-text-editor/ — that is a teaching simulation, not a lab benchmark.

**What is the risk if Ply disappears?**  
Near zero. Installed code is in your version control with no runtime dependency; deleting the CLI changes nothing about your app. Free source is also MIT at github.com/ply-ui-ng/ply.

More: [https://ply-ui.com/faq/](https://ply-ui.com/faq/) · [https://ply-ui.com/enterprise-faq/](https://ply-ui.com/enterprise-faq/) · [https://ply-ui.com/compare/](https://ply-ui.com/compare/)
<!-- answer-bank-faq:end -->

## License

This CLI *tool* (the source in this package — argument parsing, fetching, file writing) is [MIT-licensed](LICENSE). Free-tier components it installs are also MIT ([repo LICENSE.md](https://github.com/ply-ui-ng/ply/blob/main/LICENSE.md)). Pro components require a paid license and are not MIT — see [LICENSE-PRO.md](https://github.com/ply-ui-ng/ply/blob/main/LICENSE-PRO.md). Pro files this CLI writes include a short header pointing at that license.

## Support

Email support@ply-ui.com.

Bugs and feature requests: [github.com/ply-ui-ng/ply/issues](https://github.com/ply-ui-ng/ply/issues).

