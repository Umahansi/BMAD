---
title: 'Story 1.1: Open the app and see an empty screen'
type: 'feature'
created: '2026-10-26'
status: 'in-progress'
baseline_revision: '4b825dc642cb6eb9a060e54bf8d69288fbee4904'
review_loop_iteration: 0
followup_review_recommended: false
context: ['_bmad-output/implementation-artifacts/epic-1-context.md']
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** umasha needs a scaffolded project with a layered source structure and a first screen, so a user has something to open and a developer has a structure to build on.

**Approach:** Scaffold with `create-vite`'s `vanilla-ts` template, arrange the source into `src/main.ts`, `src/core/`, `src/storage/`, `src/ui/`, `src/styles.css`, `tests/`, and render a Screen with a text input, an Add button and an empty-state hint, backed by a single `Task[]` store in `main.ts`. The Add form is a non-functional placeholder; `core` ships only the `Task` type and `MAX_TASK_LENGTH`.

## Boundaries & Constraints

**Always:**
- `core` exports `Task = { id: string; text: string; done: boolean }` and `MAX_TASK_LENGTH = 200`, and imports nothing from the browser, `ui`, `storage` or `main`.
- `src/main.ts` owns the single store (`state: Task[]`, starting `[]`) and re-renders the Screen whenever state changes; `ui` exposes `render(container, tasks)` that `main.ts` calls on load and on every future state change.
- The Screen (empty list) shows: a text input (`maxlength` = `MAX_TASK_LENGTH`), an Add submit button, and the hint "No tasks yet. Add one above." No task rows render when `tasks.length === 0`.
- `npm run dev`, `npm run build` and `npm test` each exit 0; `npm test` runs at least one passing Vitest test importing from `src/core`.
- No runtime (`dependencies`) packages beyond what the template ships; Vitest and test-only tooling are `devDependencies` only.
- Keep whatever TypeScript version the scaffolded template pins (do not force `7.0.2`).

**Never:**
- Do not wire the Add form to append, validate or persist a task -- submit only prevents default navigation (Story 1.2 builds that).
- Do not add a reducer, actions, or `localStorage` code; `src/storage/` stays an empty placeholder directory.
- Do not use `innerHTML`/`outerHTML`/`insertAdjacentHTML` anywhere task text could flow.
- Do not add a UI framework or any network/runtime dependency.

</intent-contract>

## Code Map

- `package.json` -- EXISTS: `create-vite` `vanilla-ts` scaffold; `devDependencies` only (`typescript ~6.0.3`, `vite ^8.3.4`, `vitest ^5.0.5`); no `dependencies` key; `"test": "vitest run"`, `"build": "tsc && vite build"`, `"dev": "vite"`.
- `index.html` -- EXISTS: mounts `<div id="app">`, `<title>umasha</title>`, loads `/src/main.ts`.
- `tsconfig.json` -- EXISTS: bundler-mode config, `include: ["src"]`, `lib: ["ES2023", "DOM"]`.
- `src/main.ts` -- EXISTS: `let state: Task[] = []`, local `setState(next)` sets `state` and calls `render(root, state)`; invoked once on load. Sole owner of the store and sole caller of `ui/screen.ts`'s `render`.
- `src/core/task.ts` -- EXISTS: `Task = { id: string; text: string; done: boolean }`, `MAX_TASK_LENGTH = 200`; no imports.
- `src/core/index.ts` -- EXISTS: barrel re-export of `Task` and `MAX_TASK_LENGTH` from `task.ts`.
- `src/ui/screen.ts` -- EXISTS: `render(container, tasks)` clears the container, builds a labelled `<input maxLength={MAX_TASK_LENGTH}>` + submit `<button>Add</button>` inside a `<form>` whose submit handler only calls `preventDefault()`, appends the hint `<p>` with text `"No tasks yet. Add one above."` only when `tasks.length === 0`, then appends an empty `<ul>`.
- `src/storage/.gitkeep` -- EXISTS: placeholder directory, no code.
- `src/styles.css` -- EXISTS: imported once from `main.ts`.
- `tests/core.test.ts` -- EXISTS: Vitest asserts `MAX_TASK_LENGTH === 200` and a `Task` literal round-trips its fields.
- No template leftovers (`src/counter.ts`, `src/style.css`) remain.

## Tasks & Acceptance

**Execution:**
- Re-verify `npm run build`, `npm test`, `npm run dev` all exit 0 against the current tree -- confirms the existing scaffold and implementation remain sound (AC: tooling).
- Re-inspect `src/core/*`, `src/ui/screen.ts`, `src/main.ts` against the Boundaries above -- confirms layering, store ownership, and placeholder-form behavior are intact; patch only if a gap is found.

**Acceptance Criteria:**
- Given the scaffolded project, when `npm run dev`, `npm run build` and `npm test` are run, then each exits without error.
- Given the app loads with an empty store, when the Screen renders, then it shows the text input, the Add button and the hint "No tasks yet. Add one above.", and no task rows.
- Given the Add form, when submitted with any text, then nothing is appended or persisted and no error is thrown.
- Given `src/core`, when inspected, then it exports `Task` and `MAX_TASK_LENGTH` (200) and imports nothing from `ui`, `storage`, `main`, or the browser.
- Given `src/main.ts`, when inspected, then it is the sole owner of the `Task[]` store and the sole caller of `ui/screen.render` on state change.

## Spec Change Log

## Review Triage Log

## Verification

**Commands:**
- `npm run build` -- expected: exits 0, emits `dist/` (re-verified this pass: exit 0).
- `npm test` -- expected: exits 0, `tests/core.test.ts` assertions pass (re-verified this pass: 2/2 passed).
- `npm run dev -- --port <n>` (brief, then stopped) -- expected: starts and serves `index.html` without throwing (re-verified this pass: served correctly, process stopped cleanly).

**Manual checks (if no CLI):**
- Open the built/dev page: confirm input, Add button and exact hint text are visible, and no `li` rows exist in the `ul`.
