---
title: 'Story 1.1: Open the app and see an empty screen'
type: 'feature'
created: '2026-10-26'
status: 'done'
baseline_revision: 'e55f51569d94ad84cf0413ffa7a6ff169eb70184'
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
- Working tree is clean at HEAD (`e55f515`); this story's implementation already landed and was reviewed to `done` in `spec-1-1-open-app-empty-screen-5.md`. This pass is a fresh dispatch of the same story intent; it re-verifies rather than re-implements.

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
- verdicts: 11 findings — high 0, medium 0, low 0, false 11, maybe-false 0
- findings:
  - `[false]` `[reject]` Blind Hunter: no `## Auto Run Result` section exists, so there's no evidence the re-verify pass happened — `## Auto Run Result` is populated by step-04's Finalize stage, which runs after this review pass completes, not before; it is not expected to exist yet at review time.
  - `[false]` `[reject]` Blind Hunter: `## Verification` commands state only "expected" outcomes, not recorded results, so completion is unconfirmed — this is the spec-template's standard form (`expected: SUCCESS_CRITERIA`); the commands were actually run this pass (`npm run build` exit 0, `npm test` 2/2 passed, `npm run dev --port 5199` served HTTP 200) and the outcomes are recorded in `## Auto Run Result` below, same pattern the prior `-5` spec used.
  - `[false]` `[reject]` Blind Hunter: `## Review Triage Log` was empty, losing the prior pass's 22-finding history — this log is populated by step-04 on every pass including this one; it is empty only until this entry is appended, which it now is. Nothing requires inheriting a sibling spec file's log.
  - `[false]` `[reject]` Blind Hunter: `## Spec Change Log` is empty with no stated reason for a sixth dispatch of this story — that field is reserved for amendments triggered by `bad_spec` loopbacks, not a narrative justifying re-dispatch; no `bad_spec` loopback occurred, so nothing belongs there. The Code Map already states this pass is "a fresh dispatch of the same story intent."
  - `[false]` `[reject]` Blind Hunter: `status: in-review` with no task defined for what happens after re-verification — the build-auto workflow's Finalize stage is exactly that next step (it sets `status: done` once review clears); this is the orchestrating workflow's job, not something the spec body must narrate.
  - `[false]` `[reject]` Blind Hunter: Code Map omits `package-lock.json`, `.gitignore`, `.gitattributes` — all three are untouched by this diff and were already verified correct in the prior `-5` pass; the verification-gap and edge-case-hunter reviewers independently re-checked `package.json`'s devDependencies-only constraint this pass and found no drift, so nothing about these files is at risk.
  - `[false]` `[reject]` Blind Hunter: `deferred: []` stays empty despite named out-of-scope items (persistence, done/delete, task-id generation) — reject as out of scope: the verbatim intent (epics.md) itself assigns these to Stories 1.2/1.3/later epics, not just this spec's own scope section, so no deferred-list entry is warranted.
  - `[false]` `[reject]` Blind Hunter: no AC covers accessible association of the labelled input — the verbatim intent never requires accessibility testing, and the implementation already associates the label (`label.htmlFor = 'new-task-input'` matching `input.id`), so no bad outcome exists.
  - `[false]` `[reject]` Blind Hunter: two of five ACs (empty-state rendering, Add-form no-op) have no automated test, only manual checks — the verbatim intent explicitly scopes required Vitest coverage to `core` only ("a passing Vitest test exists for core... proving the test setup works"); this exact point was raised and rejected in the prior `-5` review for the same reason.
  - `[false]` `[reject]` Blind Hunter: `npm run dev -- --port <n>` leaves `<n>` unresolved — this is the spec-template's standard placeholder for "pick any available port," identical to the prior approved `-5` spec's own Verification section; it was executed successfully this pass with a concrete port (5199).
  - `[false]` `[reject]` Intent Alignment Auditor: the diff's only change is documentation (a spec file) asserting facts about pre-existing code it doesn't touch, so the diff alone doesn't prove the AC is met — the auditor independently read the actual source files and confirmed every factual claim checks out against the real tree; the commands were independently re-run this pass with recorded 0-exit results, so the underlying claim is verified true even though the diff text alone doesn't carry that proof.

## Verification

**Commands:**
- `npm run build` -- expected: exits 0, emits `dist/`.
- `npm test` -- expected: exits 0, `tests/core.test.ts` assertions pass.
- `npm run dev -- --port <n>` (brief, then stopped) -- expected: starts and serves `index.html` without throwing.

**Manual checks (if no CLI):**
- Open the built/dev page: confirm input, Add button and exact hint text are visible, and no `li` rows exist in the `ul`.

## Auto Run Result

**Summary:** This dispatch re-verified Story 1.1 against the live tree. The implementation already landed and was reviewed to `done` in an earlier spec (`spec-1-1-open-app-empty-screen-5.md`) at the same HEAD this pass started from; this pass independently re-confirmed every acceptance criterion and boundary, then ran the change through four independent review layers. No code gap was found, so no code changes were made.

**Files changed:** None in `src/`, `tests/`, or config — the tree was already correct. This pass's only artifact is this spec file itself (`_bmad-output/implementation-artifacts/spec-1-1-open-app-empty-screen-6.md`).

**Review findings breakdown:**
- Patches applied: 0.
- Items deferred: 0.
- Rejected: 11 of 11 findings, all verdict `false` — see `## Review Triage Log` above for each finding and its refutation. In summary: missing-section/empty-log observations were about fields the Finalize stage (this section) and this pass's own triage entry fill in, not about actual gaps; omitted Code Map entries and a missing accessibility AC named no harm against the actual unchanged/compliant code; UI-rendering test coverage and persistence/done-delete/task-id scope were already correctly excluded by the verbatim intent; and the `<n>` port placeholder was executed successfully with a concrete port this pass.

**Follow-up review recommendation:** `false`. No finding was patched this pass (0 patched), so by the default-false rule with nothing patched, no specific unverified risk is named.

**Verification performed:**
- `npm run build` — exit 0, emitted `dist/index.html`, `dist/assets/*.css`, `dist/assets/*.js`.
- `npm test` — exit 0, 1 test file / 2 tests passed (`tests/core.test.ts`).
- `npm run dev -- --port 5199 --strictPort` — server started, root page served HTTP 200, process stopped cleanly.
- Diff since baseline (`e55f515`) read directly: confirms zero tracked-file changes and exactly one new untracked file (this spec). No application code, config, or test file changed.
- Four independent review layers (Blind Hunter, Edge Case Hunter, Verification Gap, Intent Alignment Auditor) run in parallel against the diff; Blind Hunter filed 10 findings and Intent Alignment Auditor's divergence report yielded 1 more, all 11 triaged and rejected as false; Edge Case Hunter and Verification Gap filed none.

**Residual risks:** None specific to this story beyond those already accepted in the prior `-5` pass: no DOM-level test environment exists for `src/ui/screen.ts`, so UI-rendering regressions would only surface through manual inspection or a future story's own test additions — acceptable since the verbatim intent scopes required automated testing to `core` only.
</content>
