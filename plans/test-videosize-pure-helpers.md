# Expose pure helpers in `lib/options/videosize.ts` as named exports + add unit tests

## Goal

Promote the 4 pure filter-builder helpers inside `lib/options/videosize.ts`
to named exports and add edge / corner / boundary / null / error /
regression coverage for each. Continues the pattern of PR #18
(`lib/utils.ts`) and PR #19 (`lib/recipes.ts`).

(Issues are disabled on `modernized-js/node-fluent-ffmpeg`, so this plan
file is the durable issue equivalent.)

## Helpers to expose

| #   | Helper                                              | One-line behaviour                                                                      |
| --- | --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | `getScalePadFilters(width, height, aspect, color)`  | Builds the two-filter `scale` + `pad` chain for a fixed canvas with a target aspect     |
| 2   | `percentScaleFilter(percent)`                       | Builds a single percent-ratio `scale` filter (rounded to an even pixel count)           |
| 3   | `fixedSizeFilters(width, height, pad)`              | Returns either a plain `scale` or a `scale` + `pad` chain, depending on the `pad` flag  |
| 4   | `partialSizeFilters(fixedWidth, fixedHeight, data)` | Builds a `scale` chain when only one axis is given, with optional aspect and pad inputs |

## Approach

- Promote each helper to a named `export function …` in the same file.
- Switch the module's factory export from `export = applyVideoSizeOptions`
  to `export default applyVideoSizeOptions`. Same TypeScript / ESLint
  constraint as `lib/recipes.ts` (PR #19): TS forbids named exports
  alongside `export =`, ESLint blocks the namespace-merge alternative.
  The single internal consumer
  (`lib/fluent-ffmpeg.ts: import applyVideoSize from './options/videosize.js'`)
  keeps working unchanged via `esModuleInterop`.

## Out of scope

- The pre-existing `data[key] = value as never;` cast inside the impure
  `createSizeFilters` helper — separate clean-up; this PR keeps focus on
  pure-helper coverage.
- `createSizeFilters` and `applySizeFilters` (both mutate state, not pure).
- The other survey targets (`lib/capabilities.ts`, `lib/ffprobe.ts`,
  `lib/processor.ts`) — separate follow-up PRs.

## Acceptance

- `lib/options/videosize.ts` exposes 4 named pure helpers.
- `test/videosize.test.ts` exists with direct unit coverage for each.
- `yarn lint`, `yarn typecheck`, `yarn test`, `yarn format:check`,
  `yarn build` all green.
- `test/processor.test.ts` size / aspect integration paths continue to
  pass unchanged.

## Steps

1. Branch `test/videosize-pure-helpers` from `main`.
2. Add `export` to each of the 4 pure helper declarations in
   `lib/options/videosize.ts`.
3. Switch `export = applyVideoSizeOptions` → `export default
applyVideoSizeOptions`.
4. Add `test/videosize.test.ts` with 4 `describe` blocks (one per helper)
   covering happy / edge / corner / null / error / regression cases.
5. Run `yarn format && yarn lint && yarn typecheck && yarn test &&
yarn build`.
6. Commit, push, open PR with the AI-generated-PR template.
7. `/codex-cross-review` to convergence.
