---
title: 'Story 1.1: Open the app and see an empty screen'
type: 'feature'
created: '2026-10-26'
status: 'in-progress'
baseline_revision: '4b825dc642cb6eb9a060e54bf8d69288fbee4904'
review_loop_iteration: 0
followup_review_recommended: false
context: ['_bmad-output/implementation-artifacts/epic-1-context.md']
warnings: ['oversized']
deferred: []
---

<intent-contract>

## Intent

**Problem:** The project folder is empty; umasha has no scaffold, no layered source structure, and no screen, so there is nothing for a user to open or a developer to build on.

**Approach:** Scaffold with `create-vite`'s `vanilla-ts` template (pinned `create-vite@9.3.1`), arrange the source into `src/main.ts`, `src/core/`, `src/storage/`, `src/ui/`, `src/styles.css`, `tests/`, and render a Screen with a text input, an Add button and an empty-state hint, backed by a single `Task[]` store in `main.ts`. The Add form is a non-functional placeholder; `core` ships only the `Task` type and `MAX_TASK_LENGTH`.

## Boundaries & Constraints

**Always:**
- `core` exports `Task = { id: string; text: string; done: boolean }` and `MAX_TASK_LENGTH = 200`, and imports nothing from the browser, `ui`, `storage` or `main`.
- `src/main.ts` owns the single store (`state: Task[]`, starting `[]`) and re-renders the Screen from that state; `ui` exposes a `render(container, tasks)` function that `main.ts` calls, both on load and whenever state changes.
- The Screen (empty list) shows: a text input (`maxlength` = `MAX_TASK_LENGTH`), an Add submit button, and the hint "No tasks yet. Add one above." No task rows render when `tasks.length === 0`.
- `npm run dev`, `npm run build` and `npm test` each exit 0; `npm test` runs at least one passing Vitest test that imports from `src/core`.
- No runtime (`dependencies`) packages beyond what `create-vite`'s `vanilla-ts` template ships (TypeScript + the page's own CSS); Vitest and any test-only tooling are `devDependencies`.
- If the scaffolded template pins a TypeScript version other than `7.0.2`, keep the template's pinned version as-is (do not force `7.0.2`).

**Never:**
- Do not wire the Add form to append, validate or persist a task — submit just prevents default navigation. Dispatch/validation/append logic is Story 1.2.
- Do not add a reducer, actions, or `localStorage` code in this story — those belong to later stories; `src/storage/` stays an empty placeholder directory for the required layout.
- Do not use `innerHTML`/`outerHTML`/`insertAdjacentHTML` anywhere task text could flow (AD-5), even though no task text exists yet.
- Do not add a UI framework or any network/runtime dependency.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First load, empty store | `state = []` | Input + Add button render; hint "No tasks yet. Add one above." shown; no `li` rows in the list | No error expected |
| Placeholder submit | User types text and submits the form | `preventDefault()` only; no task appended, no console error, hint still shown | No error expected |
| `npm test` | Run from project root | Vitest reports the `core` test passing (`MAX_TASK_LENGTH` is `200`, `Task` shape compiles) | No error expected |

</intent-contract>

## Code Map

- `package.json` -- NEW, from `create-vite@9.3.1 --template vanilla-ts`; add `vitest` devDependency and a `"test": "vitest run"` script; no new runtime `dependencies`.
- `index.html` -- NEW/edited scaffold entry; mounts into `#app`; update `<title>` to "umasha".
- `src/main.ts` -- NEW: holds `let state: Task[] = []`; a `setState(next)` that assigns and re-renders; calls `render(root, state)` once on load. No actions dispatched yet (nothing currently calls `setState` besides the initial render).
- `src/core/index.ts` -- NEW: barrel export for the layer's public surface.
- `src/core/task.ts` -- NEW: defines `export type Task = { id: string; text: string; done: boolean }` and `export const MAX_TASK_LENGTH = 200`. No imports.
- `src/ui/screen.ts` -- NEW: `export function render(container: HTMLElement, tasks: Task[]): void` -- builds the form (labelled text input with `maxlength={MAX_TASK_LENGTH}`, submit button "Add"), the hint paragraph (shown only when `tasks.length === 0`), and an empty `ul` for future rows; form `submit` handler only calls `event.preventDefault()`.
- `src/storage/` -- NEW placeholder directory (e.g. `src/storage/.gitkeep`) satisfying the required layout; no code yet (Epic 2).
- `src/styles.css` -- NEW: replaces the template's default `src/style.css`; minimal layout styling, imported from `main.ts`.
- `tests/core.test.ts` -- NEW: Vitest test importing from `../src/core`, asserting `MAX_TASK_LENGTH === 200` and that a literal satisfying `Task` compiles and reads back correctly.
- Remove template leftovers that don't fit the required layout: `src/counter.ts`, `src/style.css` (superseded by `src/styles.css`), template demo markup/assets referenced only by the removed files.

## Tasks & Acceptance

**Execution:**
- `package.json`, `index.html`, `src/main.ts`, `src/style.css`, `src/counter.ts`, `src/vite-env.d.ts` -- scaffold via `npm create vite@9.3.1 . -- --template vanilla-ts` into the project root -- establishes the pinned starter and default tooling (AC: scaffold + working `dev`/`build`/`test`).
- `src/counter.ts`, `src/style.css` -- delete -- not part of the required `src/core|storage|ui|main.ts|styles.css` layout.
- `src/core/task.ts`, `src/core/index.ts` -- create -- gives `core` its `Task` type and `MAX_TASK_LENGTH`, importing nothing from the app (AC: layering).
- `src/ui/screen.ts` -- create -- renders the input/Add/hint Screen and the (currently always-empty) task list from `tasks: Task[]` (AC: empty-screen UI).
- `src/storage/.gitkeep` -- create -- keeps the required empty placeholder directory present without adding Epic-2 behavior early.
- `src/styles.css` -- create -- minimal styles for the form and hint; imported once from `main.ts`.
- `src/main.ts` -- rewrite -- declares the single `Task[]` store, calls `ui/screen.render` on load and on every future state change (AC: single store + re-render in `main`).
- `index.html` -- edit -- set page `<title>` to "umasha"; keep the `#app` mount point.
- `package.json` -- edit -- add `vitest` devDependency and `"test": "vitest run"` script; confirm no new runtime `dependencies` were introduced.
- `tests/core.test.ts` -- create -- first passing Vitest test, proving `npm test` works against `core`.

**Acceptance Criteria:**
- Given the scaffolded project, when `npm run dev`, `npm run build` and `npm test` are run, then each exits without error.
- Given the app loads with an empty store, when the Screen renders, then it shows the text input, the Add button and the hint "No tasks yet. Add one above.", and no task rows.
- Given the Add form, when it is submitted with any text, then nothing is appended or persisted (placeholder only) and no error is thrown.
- Given `src/core`, when its exports and imports are inspected, then it exports `Task` and `MAX_TASK_LENGTH` (200) and imports nothing from `ui`, `storage`, `main`, or the browser.
- Given `src/main.ts`, when inspected, then it is the sole owner of the `Task[]` store and the sole caller that triggers `ui/screen.render` on state change.

## Design Notes

`main.ts`'s re-render hook (`setState`) has no caller yet besides the initial render, since Story 1.1's form is an inert placeholder — this is intentional: it proves the store/re-render wiring AD-1/AD-2/AD-7 call for, ready for Story 1.2 to drive it via a real `add` action without touching `main.ts`'s shape again.

## Verification

**Commands:**
- `npm install` -- expected: completes with 0 runtime `dependencies` beyond the template's own (TypeScript), `vitest` present only under `devDependencies`.
- `npm run build` -- expected: exits 0, emits a static `dist/` bundle.
- `npm test` -- expected: exits 0, Vitest reports the `tests/core.test.ts` assertions passing.
- `npm run dev -- --port 0` (started with a short timeout, then stopped) -- expected: the dev server starts and serves `index.html` without throwing.

**Manual checks (if no CLI):**
- Open the built/dev page: confirm the input, Add button and the exact hint text are visible, and no `li` task rows exist in the `ul`.
