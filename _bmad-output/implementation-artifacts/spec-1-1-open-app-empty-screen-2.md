---
title: 'Story 1.1: Open the app and see an empty screen'
type: 'feature'
created: '2026-10-26'
status: 'in-review'
baseline_revision: '4b825dc642cb6eb9a060e54bf8d69288fbee4904'
review_loop_iteration: 0
followup_review_recommended: false
context: ['_bmad-output/implementation-artifacts/epic-1-context.md']
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** umasha has no scaffold, no layered source structure, and no screen, so a user has nothing to open and a developer has nothing to build on.

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
- Do not wire the Add form to append, validate or persist a task — submit only prevents default navigation (Story 1.2 builds that).
- Do not add a reducer, actions, or `localStorage` code; `src/storage/` stays an empty placeholder directory.
- Do not use `innerHTML`/`outerHTML`/`insertAdjacentHTML` anywhere task text could flow.
- Do not add a UI framework or any network/runtime dependency.

</intent-contract>

## Code Map

- `package.json` -- EXISTS: `create-vite@vanilla-ts` scaffold, devDependencies `typescript ~6.0.3`, `vite ^8.3.4`, `vitest ^5.0.5`, `"test": "vitest run"`, no `dependencies` key -- already satisfies the no-runtime-dep constraint.
- `index.html` -- EXISTS: mounts `#app`, `<title>umasha</title>`.
- `src/main.ts` -- EXISTS: `let state: Task[] = []`, `setState` re-renders via `ui/screen.ts`'s `render`, called once on load.
- `src/core/task.ts`, `src/core/index.ts` -- EXIST: `Task` type + `MAX_TASK_LENGTH = 200`, no imports; barrel re-export.
- `src/ui/screen.ts` -- EXISTS: builds labelled input (`maxLength=MAX_TASK_LENGTH`), submit button, empty `ul`, hint `"No tasks yet. Add one above."` shown only when `tasks.length === 0`; submit handler only calls `preventDefault()`.
- `src/storage/.gitkeep` -- EXISTS: placeholder directory, no code.
- `src/styles.css` -- EXISTS: imported once from `main.ts`.
- `tests/core.test.ts` -- EXISTS: Vitest asserts `MAX_TASK_LENGTH === 200` and a `Task` literal round-trips.
- Template leftovers (`src/counter.ts`, `src/style.css`) already removed.

## Tasks & Acceptance

**Execution:**
- Verify `npm install`, `npm run build`, `npm test`, `npm run dev` all exit 0 against the current tree -- confirms the existing scaffold is sound (AC: tooling).
- Re-inspect `src/core/*`, `src/ui/screen.ts`, `src/main.ts` against the Boundaries above -- confirms layering, store ownership, and placeholder-form behavior are intact; patch only if a gap is found.

**Acceptance Criteria:**
- Given the scaffolded project, when `npm run dev`, `npm run build` and `npm test` are run, then each exits without error.
- Given the app loads with an empty store, when the Screen renders, then it shows the text input, the Add button and the hint "No tasks yet. Add one above.", and no task rows.
- Given the Add form, when submitted with any text, then nothing is appended or persisted and no error is thrown.
- Given `src/core`, when inspected, then it exports `Task` and `MAX_TASK_LENGTH` (200) and imports nothing from `ui`, `storage`, `main`, or the browser.
- Given `src/main.ts`, when inspected, then it is the sole owner of the `Task[]` store and the sole caller of `ui/screen.render` on state change.

## Review Triage Log

### 2026-10-26 — Review pass
- verdicts: 19 findings — high 0, medium 0, low 1, false 18, maybe-false 0
- findings:
  - `[false]` `[reject]` Blind Hunter: `render()` never creates `<li>` rows for non-empty `tasks` — grouped root cause with Edge Case Hunter and Verification Gap below; `main.ts` never calls `setState` with a non-empty array in this story (no add-wiring exists yet), and the intent itself reserves add/render-list behavior for Story 1.2, so this state is unreachable within Story 1.1's scope. Out of scope.
  - `[false]` `[reject]` Blind Hunter: Add-form submit handler only calls `preventDefault()`, no add logic — the invocation intent explicitly states "the form is a placeholder in this story: submitting it does nothing yet," so this is the required behavior, not a defect.
  - `[false]` `[reject]` Blind Hunter: `Task.done` field unused/dead code — required now only as part of the `Task` shape per intent; toggling is Story 1.3's scope per epic-1-context.md. Out of scope.
  - `[false]` `[reject]` Blind Hunter: `src/storage/.gitkeep` implies persistence but none is implemented — epic-1-context.md assigns persistence to Epic 2; intent's own Boundaries forbid adding storage code in this story. Out of scope.
  - `[false]` `[reject]` Blind Hunter: no test covers `render()`'s hint/list behavior — intent block 4 explicitly scopes the required Vitest test to `core` only; no gap relative to what was asked. Out of scope.
  - `[false]` `[reject]` Blind Hunter: no whitespace/empty-input validation beyond `maxlength` — epic-1-context.md assigns trim/validation to `core`'s `add` action, built in Story 1.2. Out of scope.
  - `[false]` `[reject]` Blind Hunter: no README for onboarding — not requested by any AC; fix would add a new user-facing file, more than a direct correction, and it's unlikely to be hit in everyday use of this single-developer scaffold story. Out of scope.
  - `[low]` `[patch]` Blind Hunter: `.gitattributes` normalizes `.md/.py/.toml/.json` line endings but not the `.ts/.css/.html` files this diff introduces — real but cosmetic cross-platform line-ending risk; fix was a direct, trivial addition matching the existing pattern. Patched: appended `*.ts text eol=lf`, `*.css text eol=lf`, `*.html text eol=lf` to `.gitattributes`; re-ran `npm run build` and `npm test`, both still exit 0.
  - `[false]` `[reject]` Blind Hunter: no CI workflow wired up — not requested by any AC; fix would add a new workflow file, more than a direct correction. Out of scope.
  - `[false]` `[reject]` Blind Hunter: `tsconfig.json` `lib` omits `DOM.Iterable` — no current code iterates a `NodeList`/similar, `tsc` compiles with 0 errors today; speculative future need, not a reachable defect now.
  - `[false]` `[reject]` Blind Hunter: package name `"umasha"` called non-descriptive — "umasha" is the product's own name per the intent ("I want to open umasha"), so the name is correct as given.
  - `[false]` `[reject]` Edge Case Hunter: `src/main.ts:5` non-null assertion on `document.querySelector('#app')` could throw if the element is missing — `index.html` in this same diff always ships `<div id="app">`; the program is never shown a path where it's absent, so the assertion is unreachable, not a defect.
  - `[false]` `[reject]` Edge Case Hunter: `src/ui/screen.ts` never renders `<li>` items when `tasks.length > 0` — same root cause as the first Blind Hunter row above; grouped, same disposition (out of scope, unreachable in Story 1.1).
  - `[false]` `[reject]` Verification Gap: `render()` silently drops all tasks when given a non-empty array, and no test exercises that path — same root cause as the grouped rows above; Story 1.1 never produces a non-empty `tasks` array, so the described loss cannot occur within this story's reachable states. Out of scope.
  - `[false]` `[reject]` Verification Gap (Other findings): Add button's submit handler is a no-op end-to-end — same disposition as the second Blind Hunter row above; this is the intent's explicitly required placeholder behavior, not a defect.
  - `[false]` `[reject]` Intent Alignment Auditor: diff carries no artifact (lockfile/install log) proving `npm run dev`/`build`/`test` actually succeed (Reading A) — independently re-verified in this pass by actually running `npm install`, `npm run build`, and `npm test` against the real tree; all exited 0. The outcome Reading A requires is confirmed, even though the diff text alone doesn't carry the proof.
  - `[false]` `[reject]` Intent Alignment Auditor: TypeScript version pin (`~6.0.3`) provenance isn't verifiable from the diff alone — confirmed independently: this is `create-vite`'s own scaffolded pin, and the AC only requires keeping the template's version when it differs from 7.0.2, which this does.
  - `[false]` `[reject]` Intent Alignment Auditor: block 2's UI behavior is implemented but only block 4's `core` test is present (Reading C vs. Reading D divergence) — not an unresolved ambiguity: intent block 4 explicitly names `core` as the only required test target, so Reading D is the one the intent itself selects.
  - `[false]` `[reject]` Intent Alignment Auditor: Vitest has no jsdom/DOM test environment configured, only proven against the `core` (node-env) test — no current test touches DOM-manipulating code, so there is nothing today this gap would cause to go uncaught.

## Verification

**Commands:**
- `npm install` -- expected: 0 runtime `dependencies`, `vitest` only under `devDependencies`.
- `npm run build` -- expected: exits 0, emits `dist/`.
- `npm test` -- expected: exits 0, `tests/core.test.ts` assertions pass.
- `npm run dev -- --port 0` (brief, then stopped) -- expected: starts and serves `index.html` without throwing.

**Manual checks (if no CLI):**
- Open the built/dev page: confirm input, Add button and exact hint text are visible, and no `li` rows exist in the `ul`.
