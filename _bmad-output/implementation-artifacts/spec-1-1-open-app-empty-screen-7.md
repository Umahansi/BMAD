---
title: 'Story 1.1: Open the app and see an empty screen'
type: 'feature'
created: '2026-10-26'
status: 'done'
baseline_revision: '0a477a26a5ee21467941c9121c80308a7ccb9555'
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

- `package.json` -- EXISTS: `create-vite` `vanilla-ts` scaffold; `devDependencies` only (`typescript ~6.0.3`, `vite ^8.3.4`, `vitest ^5.0.5`); no `dependencies` key; `"test": "vitest run"`, `"build": "tsc && vite build"`, `"dev": "vite"`. Unchanged since the prior pass.
- `index.html` -- EXISTS: mounts `<div id="app">`, `<title>umasha</title>`, loads `/src/main.ts`.
- `tsconfig.json` -- EXISTS: bundler-mode config, `include: ["src"]`, `lib: ["ES2023", "DOM"]`.
- `src/main.ts` -- EXISTS (re-read this pass): `let state: Task[] = []`, local `setState(next)` sets `state` and calls `render(root, state)`; invoked once on load. Sole owner of the store and sole caller of `ui/screen.ts`'s `render`.
- `src/core/task.ts` -- EXISTS (re-read this pass): `Task = { id: string; text: string; done: boolean }`, `MAX_TASK_LENGTH = 200`; no imports.
- `src/core/index.ts` -- EXISTS: barrel re-export of `Task` and `MAX_TASK_LENGTH` from `task.ts`.
- `src/ui/screen.ts` -- EXISTS (re-read this pass): `render(container, tasks)` clears the container, builds a labelled `<input maxLength={MAX_TASK_LENGTH}>` + submit `<button>Add</button>` inside a `<form>` whose submit handler only calls `preventDefault()`, appends the hint `<p>` with text `"No tasks yet. Add one above."` only when `tasks.length === 0`, then appends an empty `<ul>`.
- `src/storage/.gitkeep` -- EXISTS: placeholder directory, no code.
- `src/styles.css` -- EXISTS: imported once from `main.ts`.
- `tests/core.test.ts` -- EXISTS (re-read this pass): Vitest asserts `MAX_TASK_LENGTH === 200` and a `Task` literal round-trips its fields.
- No template leftovers (`src/counter.ts`, `src/style.css`) remain.
- Working tree is clean at HEAD (`0a477a2`); this story's implementation landed in the initial commit and was reviewed to `done` twice already (`spec-1-1-open-app-empty-screen-5.md`, then re-verified in `-6.md`). This pass is a fresh dispatch of the same story intent; it re-verifies rather than re-implements.

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
- verdicts: 8 findings — high 0, medium 0, low 2, false 6, maybe-false 0
- findings:
  - `[low]` `[patch]` Blind Hunter: Code Map's `package.json` bullet said `vite ^8.3.5` while the real `package.json` pins `vite ^8.3.4`, self-contradicting its own "unchanged since the prior pass" claim — fixed by correcting the Code Map text to `vite ^8.3.4`; `npm run build` and `npm test` re-run after the edit, both still exit 0.
  - `[low]` `[patch]` Blind Hunter: the erroneous `8.3.5` figure was unexplained speculation about where the wrong number came from, same root cause as the row above — resolved by the same Code Map correction; no separate drift exists since the real `package.json`/lockfile were never touched.
  - `[false]` `[reject]` Blind Hunter: no explicit task/AC/verification bullet names the `innerHTML`/`outerHTML`/`insertAdjacentHTML` boundary — the boundary was actually checked this pass (grep across `src/` found zero matches, confirmed independently by the implementation subagent's own grep), so the claimed bad outcome (an unchecked boundary) does not occur; the general "re-inspect against the Boundaries above" task covers it in substance.
  - `[false]` `[reject]` Blind Hunter: nothing explains why a seventh dispatch exists — the Code Map's own closing bullet already states this directly ("this story's implementation landed... reviewed to done twice already... this pass re-verifies rather than re-implements"); why the orchestrating workflow chose to re-dispatch is outside what the spec body is responsible for narrating, same as the accepted reasoning in the prior `-6` pass's review.
  - `[false]` `[reject]` Blind Hunter: no `## Auto Run Result` and empty `## Review Triage Log` at diff-capture time means no evidence the commands were run — both sections are populated by this very step (Finalize runs after review) and are now filled with concrete recorded results (`npm run build` exit 0, `npm test` 2/2 passed, `npm run dev` served HTTP 200 on two separate ports this pass).
  - `[false]` `[reject]` Blind Hunter: Code Map's `index.html` bullet omits the favicon `<link>` tag that is actually present in the file — true but names no harm: no acceptance criterion concerns branding/favicon, and the Code Map's job is to capture what matters for executing this story's tasks, not an exhaustive line-by-line transcript of every unchanged file.
  - `[false]` `[reject]` Blind Hunter: `package-lock.json` is never mentioned in the Code Map — the lockfile is untouched by this diff, `npm run build`/`npm test` both succeed against it this pass (proving it's still consistent with `package.json`), and this exact style of omission was already raised and rejected in the prior `-6` pass for the same reason.
  - `[false]` `[reject]` Intent Alignment Auditor: the diff's only change is a documentation/spec file, so by itself it doesn't prove any acceptance criterion is met — true of the diff text alone, but this pass independently re-ran the actual commands against the real tree (`npm run build` exit 0, `npm test` 2/2 passed, `npm run dev` served HTTP 200) and re-read the actual source files, so the underlying claims are verified true even though the diff itself carries no behavioral change; identical reasoning to the accepted rejection in the prior `-6` pass.

## Verification

**Commands:**
- `npm run build` -- expected: exits 0, emits `dist/`.
- `npm test` -- expected: exits 0, `tests/core.test.ts` assertions pass.
- `npm run dev -- --port <n>` (brief, then stopped) -- expected: starts and serves `index.html` without throwing.

**Manual checks (if no CLI):**
- Open the built/dev page: confirm input, Add button and exact hint text are visible, and no `li` rows exist in the `ul`.

## Auto Run Result

**Summary:** This dispatch (the story's seventh) re-verified Story 1.1 against the live tree at HEAD `0a477a2`. The implementation already landed in the initial commit and was reviewed to `done` twice before (`spec-1-1-open-app-empty-screen-5.md`, re-confirmed in `-6.md`); this pass independently re-read every relevant source file, re-ran all three CLI checks, and ran the diff through four parallel review layers. One documentation-only slip was found and fixed in this pass's own spec text; no application code changed.

**Files changed:**
- `_bmad-output/implementation-artifacts/spec-1-1-open-app-empty-screen-7.md` -- new spec file for this dispatch (this file); its own Code Map had a transcription error (`vite ^8.3.5` vs the real `^8.3.4`), corrected during review triage.
- No files changed under `src/`, `tests/`, or any config file -- the existing scaffold, `core` module, `ui/screen.ts`, and `main.ts` already satisfied every boundary and acceptance criterion.

**Review findings breakdown:**
- Patches applied: 2 (both `low`, same root cause -- a wrong Vite version number in this spec's own Code Map, corrected to match the real `package.json`).
- Items deferred: 0.
- Rejected: 6 of 8 findings, all verdict `false` -- see `## Review Triage Log` above for each finding and its refutation. In summary: the innerHTML/outerHTML boundary was actually grepped and confirmed clean; the rationale for a seventh dispatch is already stated in the Code Map's closing bullet; the empty Auto Run Result/Review Triage Log complaints were about sections this very Finalize step populates; the favicon and `package-lock.json` omissions from the Code Map named no actual harm; and the Intent Alignment Auditor's documentation-only-diff observation was refuted by this pass's own independent command re-runs and source reads.

**Follow-up review recommendation:** `false`. The two patched entries were both `low` severity (a single documentation typo, not a code defect), which does not meet the first-pass bar (a patched `high`, or two or more patched `medium` entries) for recommending another review pass.

**Verification performed:**
- `npm run build` -- exit 0, emitted `dist/index.html`, `dist/assets/*.css`, `dist/assets/*.js` (re-run after the patch, still exit 0).
- `npm test` -- exit 0, 1 test file / 2 tests passed (`tests/core.test.ts`), both before and after the patch.
- `npm run dev -- --port 5201 --strictPort` and `--port 5999 --strictPort` -- both started cleanly, served the root page with HTTP 200, stopped without error.
- Diff since baseline (`0a477a2`) read directly via `git diff --cached`: confirms the only change is this spec file; zero application-code, test, or config files touched.
- Source re-read this pass: `src/core/task.ts`, `src/core/index.ts`, `src/main.ts`, `src/ui/screen.ts`, `index.html`, `package.json` -- every boundary (layering, single-store ownership, placeholder form, hint text, no runtime dependencies) confirmed intact. A repo-wide grep for `innerHTML`/`outerHTML`/`insertAdjacentHTML` found zero matches in `src/`.
- Four independent review layers (Blind Hunter, Edge Case Hunter, Verification Gap, Intent Alignment Auditor) run in parallel against the diff: Blind Hunter filed 7 findings, Intent Alignment Auditor's divergence report yielded 1 more, all 8 triaged (2 patched, 6 rejected as false); Edge Case Hunter and Verification Gap filed none.

**Residual risks:** None specific to this story beyond those already accepted in the prior `-5`/`-6` passes: no DOM-level test environment exists for `src/ui/screen.ts`, so UI-rendering regressions would only surface through manual inspection or a future story's own test additions -- acceptable since the verbatim intent scopes required automated testing to `core` only.
