Thanks for the PR.

This repository accepts changes to **MIT free-tier** components (`components/`), the CLI (`packages/cli`), and the MCP server (`packages/mcp`).

Please:

1. Keep Pro source, license keys, and authenticated registry URLs out of the diff.
2. Include or update a spec next to the code you changed.
3. Note what you ran locally (`npm test`, `npm run lint`, CLI/MCP tests if relevant).

You cannot merge this PR. A maintainer merges after CI is green. Direct pushes to `main` / `compat/*` are blocked. See [CONTRIBUTING.md](CONTRIBUTING.md).
