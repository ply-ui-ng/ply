# Security Policy

Ply ships code that other people run. This document states what the tooling
does on your machine, how to report a problem, and what you can verify yourself
rather than take on trust.

## Reporting a vulnerability

Email **security@ply-ui.com** with a description, affected versions, and a
reproduction. Please do not open a public issue for an unfixed vulnerability.

| | Target |
|---|---|
| Acknowledgement | 3 business days |
| Initial assessment | 7 business days |
| Fix or documented mitigation | 30 days for high/critical |

These are targets from a small team, not a contractual SLA. If you have not
heard back within the acknowledgement window, open a public issue titled
"security contact ping" with no details and it will be escalated.

Reports made in good faith will not be met with legal action. Credit is offered
in the changelog unless you prefer to stay anonymous.

## Supported versions

| Component | Supported |
|---|---|
| `ply-ui-cli` | latest minor |
| `ply-ui-mcp` | latest minor |
| Component source copied into your project | you own it — pull fixes with `npx ply-ui-cli update` |

## What the CLI does on your machine

`ply-ui-cli` makes **outbound `GET` requests only**. It never sends a `POST`,
never transmits your source code, environment variables, credentials, or
telemetry, and has no analytics of any kind.

| Request | When | Sends |
|---|---|---|
| `GET ply-ui.com/registry/index.json` | `add`, `list`, `diff`, `update` | nothing |
| `GET ply-ui.com/registry/index.json.sig` | same as above | nothing |
| `GET ply-ui.com/registry/styles/default/<name>.json` | free component install | nothing |
| `GET pro.ply-ui.com/registry/...` | pro component install | your license key, as a bearer token |
| `GET ply-ui.com/assets/icons*.svg` | `init` | nothing |

The environment variables read are `PLY_LICENSE_KEY`,
`PLY_REGISTRY_URL`, `PLY_PRO_REGISTRY_URL`, `PLY_REQUIRE_SIGNATURE`,
`PLY_CLI_PATH`, and `PLY_CWD`. The matching `BASE_UI_*` names still work.

Files written on your machine: components under your configured alias,
`ply-ui.json`, `ply-ui-lock.json`, `ply-ui.css` next to your global
stylesheet (legacy `base-ui.json` / `base-ui-lock.json` / `base-ui.css` still
resolve), the icon sprites, and an `assets` entry in `angular.json`.

### Opting out and locking down

```bash
# Refuse to install anything that is not signed and digest-verified
export PLY_REQUIRE_SIGNATURE=1

# Point the CLI at your own mirror
export PLY_REGISTRY_URL=https://registry.internal.example.com/registry
```

## Supply-chain controls

**No install hooks.** The published package declares no `preinstall`,
`postinstall`, or `prepare` script. `npm install ply-ui-cli` executes no code.
This is the vector used by essentially every real npm compromise, and it is
closed by construction.

**Tokenless releases.** Releases publish from GitHub Actions via npm Trusted
Publishing (OIDC). No long-lived npm token exists to leak or be stolen: npm
accepts a publish of `ply-ui-cli` only from this repository's `deploy.yml`,
authenticated by a short-lived workflow credential. Every published tarball
carries a registry signature:

```bash
npm audit signatures          # verifies npm's registry signature
npm view ply-ui-cli dist.signatures
```

**No Sigstore provenance, and why.** npm does not issue provenance attestations
for packages built from a *private* source repository — a
[documented limitation](https://github.blog/changelog/2023-07-25-publishing-with-npm-provenance-from-private-source-repositories-is-no-longer-supported/)
that applies even when the package itself is public. This repository is private
because it contains the pro catalog, so `npm view ply-ui-cli dist.attestations`
is empty and no attestation ties a tarball to a commit SHA. We would rather say
so than imply a guarantee that does not exist.

What covers the same ground: publishing is restricted to this workflow (above),
the registry index is signed with a key that never touches the web host, every
component payload is digest-verified before it is written, and CI asserts the
tarball's exact file list. Those checks protect the code the CLI puts in your
repository, which is the part that ends up in your build.

**Signed registry index.** The component index is signed with an Ed25519 key
held in GitHub Actions secrets, not on the web host, and verified against public
keys compiled into each CLI release. Compromising the website alone is not
enough to serve a forged index.

**Per-item digests.** Every index entry carries a SHA-256 digest of the item
payload. The CLI recomputes it from what it actually downloaded and **aborts
before writing any file** on mismatch. Pro items are fetched from a different
origin than the index that vouches for them, so neither origin can substitute
source on its own.

**Path-traversal refusal.** Registry filenames are rejected if absolute, if they
contain `..`, or if they carry a drive letter. Payloads are schema-validated
with Zod before use.

**No code execution.** Downloaded content is written to disk. It is never
`eval`'d, imported, or executed by the CLI.

**No shell.** The CLI never imports `child_process` and never spawns npm, pnpm,
yarn, or bun. Missing npm packages are printed as an install command. Dependency
names from the registry are still validated against the npm name grammar before
they are shown.

**Change tracking.** `base-ui-lock.json` records a SHA-256 for every installed
file, so `npx ply-ui-cli diff` shows exactly what upstream changed and what you
changed, and `update` never silently overwrites your edits.

**Dependency footprint.** The published tarball has **no runtime npm
dependencies** — `diff`, `ora`, `prompts`, and `zod` are bundled into
`dist/index.js` at publish time. CI blocks a release when the shipped tree of **either**
published package (`ply-ui-cli` or `ply-ui-mcp`) carries a moderate or
higher advisory, and asserts the CLI tarball contains nothing but `dist/`,
`README.md`, `LICENSE`, and `package.json`. Both packages currently report zero
vulnerabilities in their shipped trees:

```bash
cd packages/cli && npm audit --omit=dev
cd packages/mcp && npm audit --omit=dev
```

**Reproducible installs.** Every package commits its lockfile, and CI and the
release build both use `npm ci`. The tree that gets audited is byte-for-byte the
tree the published tarball is built from — a transitive dependency cannot change
between the audit passing and the artifact being published.

## Verifying a release yourself

```bash
npm view ply-ui-cli versions
npm pack ply-ui-cli && tar -tzf ply-ui-cli-*.tgz   # inspect the file list
npm audit signatures                                  # npm registry signature
node -e "console.log(require('ply-ui-cli/package.json').scripts)"  # no install hooks
```

The published `dist/index.js` is the CLI dispatcher only. Registry HTTP lives in
separate `dist/commands/*.js` files produced by the same unminified `tsup` build
of `packages/cli/src` (minification is off so scanners can read the shipped
files). Because the source repository is private, that correspondence
is not machine-verifiable from the tarball alone; customers who need to audit the
source can request read access to `packages/cli` under NDA.

## Reporting license-validation issues

Bypasses of the pro registry's license validation are commercial issues, not
security vulnerabilities, and are out of scope for coordinated disclosure. Email
support@ply-ui.com instead.
