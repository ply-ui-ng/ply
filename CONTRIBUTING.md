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

PRs against **free** source, the CLI, and the MCP are welcome.

1. Fork this repo and branch from `main`.
2. Change files under `components/<item>/`, `packages/cli/`, or `packages/mcp/`.
3. Add or update a spec next to the code you touch (`*.spec.ts`).
4. Run `npm ci && npm test && npm run lint` (and `npm test --prefix packages/cli` or `packages/mcp` if you changed those).
5. Open the PR with a short description of the why.

This public tree is synced from a private upstream (docs site, Pro registry, and the same free source). **Maintainer merges happen on that upstream first**, then this repository is updated. Your GitHub username is kept as `Co-authored-by` on the upstream commit and in the changelog. The public PR is closed with a link to that commit once the sync lands.

Please do not add Pro components, registry payloads, or license-key handling workarounds.

## Related

- Live catalog: [ply-ui.com](https://ply-ui.com)
- Free admin dashboard: [ply-ui-ng/ply-free-dashboard](https://github.com/ply-ui-ng/ply-free-dashboard)
- CLI: [`ply-ui-cli`](https://www.npmjs.com/package/ply-ui-cli)
- MCP: [`ply-ui-mcp`](https://www.npmjs.com/package/ply-ui-mcp)
