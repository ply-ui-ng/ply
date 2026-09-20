# Contributing to Ply

This repository ([ply-ui-ng/ply](https://github.com/ply-ui-ng/ply)) holds:

- MIT **free-tier** component source in `components/` (same layout as `npx ply-ui-cli add`)
- MIT **CLI** (`packages/cli`, npm `ply-ui-cli`)
- MIT **MCP** (`packages/mcp`, npm `ply-ui-mcp`)
- Docs, changelog, issues, and discussions

**Pro** components are not here. Do not paste license keys, Pro source, or authenticated registry URLs into issues or PRs.

Docs and live previews: [ply-ui.com](https://ply-ui.com)

## What to open where

| Kind | Where |
| --- | --- |
| Bug in a free component, CLI, or MCP | [Issue — bug report](https://github.com/ply-ui-ng/ply/issues/new?template=bug_report.md) or a pull request |
| New free component / feature | [Issue — feature request](https://github.com/ply-ui-ng/ply/issues/new?template=feature_request.md) (a PR is welcome after discussion) |
| How-to / usage question | [Discussions — Q&A](https://github.com/ply-ui-ng/ply/discussions/new?category=q-a) |
| Something you built | [Discussions — Show and tell](https://github.com/ply-ui-ng/ply/discussions/new?category=show-and-tell) |
| Security vulnerability | Email **security@ply-ui.com** — do not open a public issue |
| License, billing, Pro catalog | Email **support@ply-ui.com** |

## Pull requests

PRs against **free** source, the CLI, and the MCP merge **on this repository**.

1. Fork this repo and branch from `main`.
2. Change files under `components/<item>/`, `packages/cli/`, or `packages/mcp/`.
3. Add or update a spec next to the code you touch (`*.spec.ts`).
4. Run `npm ci && npm test && npm run lint` (and `npm test --prefix packages/cli` or `packages/mcp` if you changed those).
5. Open the PR with a short description of the why.

A maintainer reviews and merges the PR here. Contributors cannot merge, and cannot push to `main` or `compat/*`. The private docs/Pro repo then imports `main` (`scripts/import-public-tree.sh` / the Import Public Hub workflow) so the docs site, registry, and npm publish stay in sync. Your GitHub username is kept as `Co-authored-by` on that import commit and in the changelog.

Please do not add Pro components, registry payloads, or license-key handling workarounds.

## Review and merge (rulesets)

Anyone can open **issues** and **pull requests**. GitHub rulesets block everything else:

| Action | Contributors | Maintainers (admin) |
| --- | --- | --- |
| Open an issue or discussion | Yes | Yes |
| Open a PR from a **fork** | Yes | Yes |
| Push to `main` or `compat/*` | No | Bypass only (hub sync) |
| Merge a PR | No (Read / Triage only) | Yes, after CI |
| Force-push any branch | No | Bypass only |

PRs targeting `main` need green CI (`free-source`, `cli`, `mcp`). GitHub does not let you approve your own PR, so required reviews are not used as a lock (a solo maintainer could never merge). Contributors stay unable to merge because they must not have **Write**.

**Access for future collaborators:** add them as outside collaborators on [ply-ui-ng/ply](https://github.com/ply-ui-ng/ply) with **Read** (fork + PR) or **Triage** (issues + PRs). Do not grant **Write**, and do not add community contributors as org members — org membership would also read private Pro repos.

## Related

- Live catalog: [ply-ui.com](https://ply-ui.com)
- Free admin dashboard: [ply-ui-ng/ply-free-dashboard](https://github.com/ply-ui-ng/ply-free-dashboard)
- CLI: [`ply-ui-cli`](https://www.npmjs.com/package/ply-ui-cli)
- MCP: [`ply-ui-mcp`](https://www.npmjs.com/package/ply-ui-mcp)
