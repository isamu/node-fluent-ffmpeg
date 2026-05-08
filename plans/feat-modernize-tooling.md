# Modernize fluent-ffmpeg: TypeScript + ESLint + node:test + multi-OS CI

## Goal

Take this fork of `fluent-ffmpeg` (which the upstream has marked as no longer
maintained) and modernize it so we can publish it under
`@modernized/fluent-ffmpeg`:

- All source files (`lib/**`, `index.js`) eventually written in **TypeScript**.
- All tests (`test/**`) eventually written against **`node:test` + `node:assert`**.
- `yarn lint` (ESLint flat config), `yarn build` (`tsc`), `yarn test` (`node --test`) all pass.
- CI runs on **ubuntu / macos / windows × Node 20 / 22**.
- Source files migrate **one at a time via `git mv`** so blame/history follow.

## Migration Phases

Each phase is one PR. Each PR keeps the test suite green.

| #     | Branch                         | Scope                                                                                                                                                                                                   |
| ----- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0** | `feat/modernize-tooling`       | Tooling only — package.json rename, tsconfig, eslint, prettier, CI rewrite, smoke `node:test`. No source file is renamed. Legacy mocha tests still run on Ubuntu via `test:legacy` so we keep coverage. |
| 1     | `feat/ts-utils`                | `git mv lib/utils.js lib/utils.ts` + `test/utils.test.js` → `test/utils.test.ts` (`node:test`).                                                                                                         |
| 2     | `feat/ts-presets`              | `lib/presets/*.js` → `*.ts`.                                                                                                                                                                            |
| 3     | `feat/ts-options`              | `lib/options/*.js` → `*.ts`. Includes the corresponding bits of `test/args.test.js`.                                                                                                                    |
| 4     | `feat/ts-capabilities-ffprobe` | `capabilities.js`, `ffprobe.js` + their tests.                                                                                                                                                          |
| 5     | `feat/ts-processor-recipes`    | `processor.js`, `recipes.js` + `test/processor.test.js`.                                                                                                                                                |
| 6     | `feat/ts-fluent-ffmpeg`        | `fluent-ffmpeg.js`, `index.js` + remaining tests + remove `mocha` / `should` / `nyc`. `test:legacy` script deleted.                                                                                     |
| 7     | `feat/dep-modernize`           | Replace `async@^0.2.9` with native Promise/`async@^3`, bump `which`, drop unused deps.                                                                                                                  |
| 8     | release                        | `/publish` → `@modernized/fluent-ffmpeg` first release.                                                                                                                                                 |

## Phase 0 Checklist (this PR)

### Configuration files

- [ ] `package.json`
  - `name` → `@modernized/fluent-ffmpeg`
  - `version` → `3.0.0-pre.0` (signals the fork; first published version will bump from here)
  - `type: "module"` — keep main entrypoint as CJS for now via `.cjs`/exports map (legacy code is CommonJS)
  - `main` / `exports` left untouched until source migration
  - Add `files: ["lib", "index.js", "README.md", "LICENSE"]` so we drop reliance on `.npmignore`
  - `engines.node` → `>=20`
  - devDependencies (latest stable as of 2026-05): `typescript`, `@types/node`, `eslint`, `@eslint/js`, `typescript-eslint`, `globals`, `prettier`, `eslint-config-prettier`, `tsx` (for running `*.test.ts` via `node --import tsx`)
  - Keep `mocha`, `should`, `nyc` as devDeps until Phase 6 — they back `test:legacy`
  - `scripts`:
    - `format` → `prettier --write .`
    - `format:check` → `prettier --check .`
    - `lint` → `eslint .`
    - `build` → `tsc -p tsconfig.build.json`
    - `typecheck` → `tsc -p tsconfig.json --noEmit`
    - `test` → `node --import tsx --test --test-reporter=spec "test/**/*.test.ts"`
    - `test:legacy` → `NODE_ENV=test mocha --require should --reporter spec test/*.test.js`
- [ ] `tsconfig.json` — `strict`, `module: "NodeNext"`, `target: "ES2022"`, `allowJs: true`, `checkJs: false`, `noEmit: true`, includes `lib/**/*` + `test/**/*`
- [ ] `tsconfig.build.json` — extends, `noEmit: false`, `outDir: "dist"`, `declaration: true`, narrows include to `lib/**/*` + `index.ts` (once it exists)
- [ ] `eslint.config.mjs` — flat config; `@eslint/js` recommended + `typescript-eslint` recommended; allows JS in `lib/**` and `test/**` for now; ignores `dist/`, `node_modules/`, `coverage/`, `examples/`, `doc/`, `tools/`
- [ ] `.prettierrc` — minimal sensible defaults (single quote, semi true, trailing comma all, print width 100)
- [ ] `.prettierignore` — mirror eslint ignores

### CI

- [ ] `.github/workflows/ci.yml` rewritten:
  - Matrix: `os: [ubuntu-latest, macos-latest, windows-latest]`, `node: [20, 22]`
  - All matrix cells run: install → `yarn lint` → `yarn build` → `yarn test`
  - Separate `legacy-tests` job (ubuntu only): apt-installs ffmpeg + flvtool2, runs `yarn test:legacy`
  - Drop coveralls / codecov for now — will revisit post-Phase 6 once node:test coverage lands

### Files / Repo hygiene

- [ ] `.gitignore` adds `dist/`
- [ ] `.npmignore` removed in favour of `files` field
- [ ] `Makefile` left in place for one PR (delete in Phase 6 alongside mocha removal)
- [ ] `test/smoke.test.ts` proves the new runner works:
  ```ts
  import { test } from 'node:test';
  import assert from 'node:assert/strict';
  test('module loads', async () => {
    const ffmpeg = (await import('../index.js')).default ?? (await import('../index.js'));
    assert.ok(ffmpeg);
  });
  ```

### Verification

- [ ] `yarn install` (commit refreshed `yarn.lock`)
- [ ] `yarn lint` exits 0
- [ ] `yarn build` exits 0 (no emit yet, just typecheck against existing `.js` with `checkJs: false` so it's mostly a smoke check that tsc resolves the project)
- [ ] `yarn test` exits 0 with the smoke test running
- [ ] `yarn test:legacy` not run locally (requires ffmpeg/flvtool2); CI does it

## Risks / Notes

- **`type: "module"` + existing CommonJS source.** Setting `"type": "module"` at the
  package level changes how Node resolves bare `.js` files, which could break the
  legacy CJS code in `lib/`. **Decision for Phase 0: do NOT add `"type": "module"`
  yet.** Stay CJS until the actual file migration starts. Switch to `"type": "module"`
  in Phase 6 when the last `.js` becomes `.ts`.
- **Path of least surprise for tests.** `node --test` does not walk subdirectories
  with the glob `test/**/*.test.ts` on older Node versions; pin to Node 20+
  (matches `engines`). Use `node --import tsx --test` to load TS via `tsx`.
- **`should@13` global pollution.** `should` mutates `Object.prototype`, which can
  confuse strict TS code. Mitigation: do not touch `should` in Phase 0; legacy tests
  keep using it as today, until they are replaced 1-by-1 in later PRs.
- **Windows + `NODE_ENV=test`.** The `test:legacy` script uses POSIX env-var
  prefix syntax; we keep it Linux-only in CI, so this is fine. If we ever want
  to run mocha on Windows, switch to `cross-env`.

## Out of Scope for Phase 0

- Any change to `lib/**/*.js` content
- Any test conversion beyond the single smoke test
- Dependency updates other than adding the new dev tools
- README / docs rewrites
