---
title: 'Story 1.1: Open the app and see an empty screen'
type: 'feature'
created: '2026-10-26'
status: 'done'
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

### 2026-10-26 — Review pass
- verdicts: 22 findings — high 0, medium 0, low 0, false 22, maybe-false 0
- findings:
  - `[false]` `[reject]` Blind Hunter: Add-form submit handler never reads input value, builds a `Task`, or calls back into state — intent explicitly states "the form is a placeholder in this story: submitting it does nothing yet... built in Story 1.2," and the spec's Boundaries forbid wiring Add this story. Required behavior, not a defect.
  - `[false]` `[reject]` Blind Hunter: `render()` creates an empty `<ul>` but never maps `tasks` to `<li>` rows — grouped root cause with Edge Case Hunter and Verification Gap rows below; `state` is always `[]` in this story (no add-wiring exists to populate it), so this path is unreachable within Story 1.1's scope.
  - `[false]` `[reject]` Blind Hunter: no mark-done/delete interaction, `Task.done` unused — epic-1-context.md assigns toggling to Story 1.3; intent only requires the `Task` shape to exist now.
  - `[false]` `[reject]` Blind Hunter: no task-id generation logic — only needed once Add is wired in Story 1.2; no code path creates a `Task` in this story.
  - `[false]` `[reject]` Blind Hunter: `src/storage/` has no persistence implementation — spec Boundaries explicitly forbid storage code this story ("`src/storage/` stays an empty placeholder directory"); epic-1-context.md assigns persistence to a later epic.
  - `[false]` `[reject]` Blind Hunter: `render()` rebuilds the whole form on every call, risking lost focus/in-progress text on re-render — traced all call sites: `render()` is invoked exactly once, at initial mount in `src/main.ts:14`, with the same empty state it was initialized with; no code path in this story re-renders after mount, so this cannot occur yet.
  - `[false]` `[reject]` Blind Hunter: `tsconfig.json` omits `"strict": true` — checked all of `src/` for implicit-any or unguarded nullable access beyond the already-addressed `#app` assertion (row below); none exist, so no demonstrable defect results from the omission today.
  - `[false]` `[reject]` Blind Hunter: `tsconfig.json`'s `include: ["src"]` means `tsc` never type-checks `tests/core.test.ts` — this is `create-vite`'s own vanilla-ts template default, which the intent requires scaffolding with; `tests/core.test.ts` has no type errors today, so nothing currently goes uncaught.
  - `[false]` `[reject]` Blind Hunter: no README.md for install/run/test/build instructions — not requested by any AC; adding one is more than a direct correction and unlikely to be needed in everyday use of this single-developer scaffold story.
  - `[false]` `[reject]` Blind Hunter: test coverage only exercises `src/core/task.ts`, none for `src/ui/screen.ts` — grouped root cause with a Verification Gap row below; intent block 4 explicitly scopes the required Vitest test to `core` only ("a passing Vitest test exists for core... proving the test setup works"), and the screen under test is itself an explicit placeholder superseded by Story 1.2.
  - `[false]` `[reject]` Blind Hunter: `.gitignore` doesn't exclude `coverage/` or `.env*` — no coverage tooling or env-file usage exists anywhere in this diff or the current tree, so nothing is currently at risk of being committed.
  - `[false]` `[reject]` Blind Hunter: `MAX_TASK_LENGTH` only enforced via the HTML `maxlength` attribute, no code-level validation — no code path validates/trims task text yet since Add isn't wired (row above); code-level enforcement belongs with the add logic Story 1.2 reserves.
  - `[false]` `[reject]` Edge Case Hunter: `src/main.ts:5` non-null assertion on `document.querySelector('#app')` could throw if the element is missing — `index.html` in this same diff always ships `<div id="app">`; the program has no path where it's absent, so the assertion is unreachable.
  - `[false]` `[reject]` Edge Case Hunter: `src/ui/screen.ts` never renders `<li>` items when `tasks.length > 0` — same root cause as the Blind Hunter `<ul>` row above; grouped, same disposition.
  - `[false]` `[reject]` Verification Gap (gap finding, pre-verified): `render()`'s DOM output (empty-state hint, `maxLength` wiring) has no test coverage, and the current test infra (no jsdom/happy-dom, no vitest environment config) can't exercise it without new dependencies — same root cause as the Blind Hunter test-coverage row above; intent's only testing requirement is scoped to `core`, and the screen is an explicit placeholder Story 1.2 will change, so adding a DOM test environment now is not something intent asked for.
  - `[false]` `[reject]` Verification Gap (Other findings): `render()` builds `.task-list` `<ul>` but never iterates `tasks` to append `<li>` items — same root cause as the Blind Hunter / Edge Case Hunter `<ul>` rows above; grouped, same disposition.
  - `[false]` `[reject]` Verification Gap (Other findings): Add form's submit handler only calls `preventDefault()`, never reads the input value or calls back into `setState` (invoked only once, at mount) — same root cause as the Blind Hunter Add-wiring row above; grouped, same disposition.
  - `[false]` `[reject]` Intent Alignment Auditor: diff carries no artifact (install/build/test log) proving `npm run dev`/`build`/`test` actually succeed — independently re-verified in this pass by actually running `npm run build`, `npm test`, and `npm run dev` against the real tree; all exited 0 / served HTTP 200. The outcome the AC requires is confirmed even though the diff text alone doesn't carry the proof.
  - `[false]` `[reject]` Intent Alignment Auditor: `typescript ~6.0.3` pin's provenance (kept-from-template vs. chosen) isn't verifiable from the diff alone — confirmed independently: `~6.0.3` is `create-vite`'s own current vanilla-ts scaffold pin, and the AC only requires keeping the template's version when it differs from `7.0.2`, which it does.
  - `[false]` `[reject]` Intent Alignment Auditor: AD-1/AD-2/AD-7's "re-renders from state whenever state changes" is architecturally present but empirically unexercised, since `setState` is only ever called once at mount — same root cause as the Blind Hunter Add-wiring row / Verification Gap submit-handler row above; intent explicitly scopes Story 1.1 to no state-changing interaction, so a second state change is Story 1.2's concern, not a gap here.
  - `[false]` `[reject]` Intent Alignment Auditor: the layering invariant (`core` imports nothing from `ui`/`storage`/`main`/browser) is only enforced by the current absence of such imports, with no lint or test guarding against regression — no AC or intent text asks for durability tooling, only that the boundary hold as a present, directly-inspectable fact, which it does today.
  - `[false]` `[reject]` Intent Alignment Auditor: test coverage barely overlaps the user-visible screen (only `core`'s constant/type-shape is tested, not the rendered input/button/hint) — same root cause as the Blind Hunter test-coverage row / Verification Gap gap-finding row above; intent's only testing requirement is scoped to `core`.

## Verification

**Commands:**
- `npm run build` -- expected: exits 0, emits `dist/` (re-verified this pass: exit 0).
- `npm test` -- expected: exits 0, `tests/core.test.ts` assertions pass (re-verified this pass: 2/2 passed).
- `npm run dev -- --port <n>` (brief, then stopped) -- expected: starts and serves `index.html` without throwing (re-verified this pass: served correctly, process stopped cleanly).

**Manual checks (if no CLI):**
- Open the built/dev page: confirm input, Add button and exact hint text are visible, and no `li` rows exist in the `ul`.

## Auto Run Result

**Summary:** The project already carried a complete, working implementation of Story 1.1 from an earlier pass (uncommitted). This pass re-verified every acceptance criterion against the live tree and code, found no gap, and ran it through independent multi-layer review; all 22 raised findings were out-of-scope or non-defects for this story's deliberately minimal placeholder scope, so no code changes were needed.

**Files changed:** None this pass — the implementation subagent found the existing tree already satisfied the spec. Files reviewed and confirmed correct: `package.json`, `package-lock.json`, `index.html`, `tsconfig.json`, `.gitattributes`, `.gitignore`, `src/main.ts`, `src/core/task.ts`, `src/core/index.ts`, `src/ui/screen.ts`, `src/styles.css`, `src/storage/.gitkeep`, `tests/core.test.ts`.

**Review findings breakdown:**
- Patches applied: 0.
- Items deferred: 0.
- Rejected: 22 of 22 findings, all verdict `false` — see `## Review Triage Log` above for each finding and its refutation. In summary: every raised gap (add-wiring, list rendering, done/delete, task-id generation, persistence, focus-preserving re-render, `strict` mode, test-file type-checking, README, UI test coverage, `.gitignore` scope, code-level length validation, DOM-environment coverage, AD-1/2/7 exercise, layering-guard durability) is explicitly out of this story's scope per the verbatim intent and the epic context, or is not reachable in the code paths this story actually exercises.

**Follow-up review recommendation:** `false`. No finding was patched this pass (0 patched), so by the default-false rule with nothing patched, no specific unverified risk is named.

**Verification performed:**
- `npm run build` — exit 0, emitted `dist/index.html`, `dist/assets/*.css`, `dist/assets/*.js`.
- `npm test` — exit 0, 1 test file / 2 tests passed (`tests/core.test.ts`).
- `npm run dev -- --port <n> --strictPort` (twice, on different ports) — server started, root page served HTTP 200 with the expected `#app` mount and `/src/main.ts` script tag, process stopped cleanly each time.
- Diff since the empty-tree baseline (`src`, `tests`, `package.json`, `package-lock.json`, `tsconfig.json`, `index.html`, `public`, `.gitattributes`, `.gitignore`) read and judged directly: core/UI layering, single-store ownership, exact hint text, placeholder-only form submit, and devDependencies-only scaffold all confirmed by inspection.
- Four independent review layers (Blind Hunter, Edge Case Hunter, Verification Gap, Intent Alignment Auditor) run in parallel against the diff; all 22 findings triaged and rejected as false, with evidence recorded per-row above.

**Residual risks:** None specific to this story. The screen's add/list/done/persistence behavior is intentionally inert pending Stories 1.2–1.3 and later epics, exactly as the intent specifies; no DOM-level test environment (jsdom/happy-dom) exists yet, so UI-rendering regressions in `src/ui/screen.ts` would only surface through manual inspection or a future story's own test additions — acceptable for this story since intent scopes required testing to `core` only.
