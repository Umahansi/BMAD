---
title: 'Story 1.2: Add a task'
type: 'feature'
created: '2026-10-26'
status: 'done'
baseline_revision: '598382ba0a37ac511c6b5def00509bc731ad58ae'
review_loop_iteration: 0
followup_review_recommended: false
context: ['_bmad-output/implementation-artifacts/epic-1-context.md']
warnings: ['oversized']
deferred:
  - summary: >-
      No automated (Vitest/DOM) test exercises src/ui/screen.ts or src/main.ts, so
      UI-level behaviors -- textContent-only li rendering and order, and the
      reject-vs-grow gating that decides whether the input is cleared/refocused --
      could regress without any test failing.
    evidence: |-
      Confirmed by the Verification Gap and Blind Hunter review layers: no
      vite.config.*/vitest.config.* exists and package.json has no jsdom/happy-dom
      dependency, so Vitest runs in its default node environment (no document
      global). tests/core.test.ts is the only test file and only imports
      src/core/index.ts; a grep across tests/ for render(/screen/handleAddSubmit
      found no matches. This gap predates this story (established in Story 1.1,
      where it was explicitly accepted as a residual risk) and the verbatim intent
      for this story only mandates Vitest coverage for the core reducer, which is
      fully met. Closing it requires adding a DOM-capable test environment, which
      is infrastructure work beyond this story.
    location: >-
      src/ui/screen.ts, src/main.ts
    severity: medium
---

<intent-contract>

## Intent

**Problem:** The app currently scaffolds an inert Add form (Story 1.1) -- submitting it does nothing, so a user cannot actually capture a task.

**Approach:** Add a pure `add`/`reduce` pair plus an `id` generator to `src/core/`, then wire `src/ui/screen.ts`'s existing form to dispatch through `src/main.ts`'s store: render each Task as an `li` of plain text, clear and refocus the input only when the list actually grew, and leave the input untouched (same value, same focus) when the add is rejected.

## Boundaries & Constraints

**Always:**
- `src/core/reduce.ts` exports `type Action = { type: 'add'; text: string }`, action creator `add(text: string): Action`, and `reduce(state: Task[], action: Action): Task[]`. `reduce`'s `add` case trims `text`; if the trimmed text is empty or longer than `MAX_TASK_LENGTH`, it returns the same `state` reference unchanged; otherwise it returns a new array (`[...state, newTask]`) and never mutates `state`.
- `src/core/id.ts` exports `createTaskId(): string` returning `crypto.randomUUID()`; this is the only place a Task id is generated.
- `src/core/index.ts` re-exports `Action`, `add`, `reduce` alongside the existing `Task`/`MAX_TASK_LENGTH` exports.
- `src/ui/screen.ts`'s `render(container, tasks, onAdd, focusInput = false)` renders one `<li class="task-item">` per task (`textContent = task.text`, never `innerHTML`) inside the existing `<ul class="task-list">`, in array order; the empty-state hint keeps showing only when `tasks.length === 0`.
- The form's submit handler reads `input.value` raw (untrimmed), calls `onAdd(rawValue)` (which performs the dispatch and, only on success, triggers a re-render with `focusInput = true`), and calls `input.focus()` itself only when `onAdd` returns `false` -- this is what keeps focus on the input when the Add button click shifted focus to the button on a rejected add.
- `src/main.ts` keeps owning the single `state: Task[]` store; `setState(next, focusInput = false)` only runs (and only re-renders) when `handleAddSubmit` determines the list actually grew (`next.length > state.length`), per AD-3 and AD-7.
- Keep the existing `maxLength = MAX_TASK_LENGTH` on the input (already set in Story 1.1) -- do not change it.

**Never:**
- Do not add a checkbox, Delete button, or any toggle/remove behavior to the `li` markup -- those belong to Stories 1.3 and 1.4.
- Do not use `innerHTML`/`outerHTML`/`insertAdjacentHTML` anywhere Task text could flow.
- Do not clear or refocus the input when the add is rejected (empty/whitespace/over-length) -- the typed whitespace must survive untouched (AD-3).
- Do not add a UI framework, routing, or any runtime/network dependency.
- Do not implement `toggle`/`remove` actions or their reducer cases in this story.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy path | state `[]`, text `"Buy rice"`, confirm via Enter | returns `[{id, text: "Buy rice", done: false}]`; input cleared + focused; hint hidden | No error expected |
| Trim | text `"  Call the bank  "` | saved task text is `"Call the bank"` | No error expected |
| Empty | text `""` | `reduce` returns the same `state` reference; input unchanged, keeps focus | No task added, no re-render |
| Whitespace-only | text `"   "` | same as Empty | No task added, no re-render |
| Over length | text of 201 chars (after trim) | same as Empty | No task added, no re-render |
| Exactly at limit | text of exactly 200 chars (after trim) | task added normally | No error expected |
| Markup text | text `"<b>hi</b>"` | `li.textContent` shows the literal string `<b>hi</b>`; no tags parsed | No error expected |
| Button click, invalid text | text `"   "`, confirm via Add button click | no task added; input refocused (undoing the button's own focus shift) | No task added, no re-render |

</intent-contract>

## Code Map

- `src/core/task.ts` -- EXISTS: `Task = { id, text, done }`, `MAX_TASK_LENGTH = 200`. Unchanged.
- `src/core/id.ts` -- NEW: `createTaskId(): string` wrapping `crypto.randomUUID()`. `lib: ["ES2023","DOM"]` in `tsconfig.json` already types the global `crypto`; Vitest's default `node` environment (no `vite.config.*` exists, so no custom test environment is configured) exposes `crypto.randomUUID` as a Node global, so no new test setup is needed.
- `src/core/reduce.ts` -- NEW: `Action` type, `add(text)` action creator, `reduce(state, action)` with the `add` case described above (trim, reject empty/over-length by returning the same reference, otherwise append via `createTaskId()`).
- `src/core/index.ts` -- EXISTS, barrel: add `export type { Action } from './reduce.ts'` and `export { add, reduce } from './reduce.ts'` alongside the existing `Task`/`MAX_TASK_LENGTH` re-exports.
- `src/ui/screen.ts` -- EXISTS: currently `render(container, tasks)` builds the form (input + submit button, already `maxLength`-capped) whose submit handler only calls `preventDefault()`, then an always-empty `<ul class="task-list">`. Change: accept `onAdd: (text: string) => boolean` and `focusInput = false` params; submit handler becomes `event.preventDefault(); const added = onAdd(input.value); if (!added) input.focus()`; loop over `tasks` to append one `<li class="task-item">` (`textContent = task.text`) per task before appending the list; call `input.focus()` at the end of `render` when `focusInput` is true.
- `src/main.ts` -- EXISTS: `let state: Task[] = []`, local `setState(next)` sets state and renders. Change: `setState(next, focusInput = false)`; add `handleAddSubmit(rawText): boolean` that computes `reduce(state, add(rawText))`, compares lengths to detect growth, calls `setState(next, true)` only when grown, and returns whether it grew; pass `handleAddSubmit` into `render`.
- `src/styles.css` -- EXISTS: `.task-list` has no item styling yet. Add a `.task-item` rule (padding + `overflow-wrap: anywhere`) so long unbroken text wraps instead of being clipped; `.task-list` and `#app` already have no fixed widths that would force a different outcome.
- `tests/core.test.ts` -- EXISTS: 2 passing tests for `Task`/`MAX_TASK_LENGTH`. Add a `describe('add/reduce', ...)` block per the Tasks below.

## Tasks & Acceptance

**Execution:**
- `src/core/id.ts` -- create `createTaskId()` -- single source of Task id generation (AD-2).
- `src/core/reduce.ts` -- create `Action`, `add`, `reduce` -- pure append-only state transition with trim/empty/over-length guards (AD-2, AD-3).
- `src/core/index.ts` -- re-export `Action`, `add`, `reduce` -- keeps `core`'s public surface as one barrel.
- `src/ui/screen.ts` -- wire form submit to `onAdd`, render task `li`s, handle focus -- turns the Story 1.1 placeholder form into the real Add flow (FR1, FR4, AD-5, AD-6).
- `src/main.ts` -- add `handleAddSubmit`, extend `setState` with `focusInput` -- connects UI events to the `core` reducer while keeping `main.ts` the sole store owner (AD-1, AD-7).
- `src/styles.css` -- add `.task-item` wrapping rule -- satisfies the long-text-wraps acceptance criterion.
- `tests/core.test.ts` -- cover `add`/`reduce` edge cases -- satisfies the AC's explicit Vitest coverage list.

**Acceptance Criteria:**
- Given the List is empty or holds Tasks, when I type "Buy rice" and press Enter, then a new Open Task "Buy rice" appears at the end of the List, the empty-state hint is no longer shown, and the input is cleared and keeps focus.
- Given I have typed text, when I click or tap the Add button, then the result is the same as pressing Enter.
- Given I type "  Call the bank  ", when I confirm, then the Task is saved as "Call the bank".
- Given the input is empty or whitespace-only, when I confirm, then no Task is added, the input keeps focus, and the typed whitespace is not cleared.
- Given the input, when inspected, then its `maxlength` equals `MAX_TASK_LENGTH` (200), and `core`'s `add` also ignores post-trim text over 200 characters.
- Given a Task longer than the visible width, when shown, then its text wraps onto multiple lines and is not cut off.
- Given a Task with text `<b>hi</b>`, when shown, then the literal characters are displayed and no markup is parsed.
- Given the `core` reducer, when `add` is applied, then it returns a new array without mutating the old one, each new Task gets a unique id from `createTaskId()`, and Vitest covers append order, trimming, empty text, whitespace-only text, over-200-character text, and exactly-200-character text.

## Spec Change Log

## Review Triage Log

### 2026-10-26 — Review pass
- verdicts: 12 findings — high 0, medium 4, low 2, false 6, maybe-false 0
- findings:
  - `[medium]` `[defer]` Blind Hunter: no automated test exercises `src/ui/screen.ts` or `src/main.ts` -- real gap, but the no-DOM-test-environment limitation predates this story (established and explicitly accepted as a residual risk in Story 1.1's spec); deferred rather than fixed in this pass since closing it requires adding a DOM-capable test environment (`jsdom`/`happy-dom` + config), which is infrastructure work beyond this story's scope. Recorded in frontmatter `deferred`.
  - `[medium]` `[defer]` Verification Gap: `render()`'s task-`<li>`/`textContent`/order behavior has no covering test -- same root cause and disposition as the row above (verification-gap's own filed disposition is `defer`).
  - `[medium]` `[defer]` Verification Gap: the reject-vs-grow gating between `main.ts`'s `handleAddSubmit` and `screen.ts`'s submit handler (AD-3's "don't clear/refocus on rejected add") has no covering test -- same root cause and disposition as the rows above.
  - `[medium]` `[defer]` Intent Alignment Auditor: the DOM-facing acceptance criteria (focus retention, hint visibility, click-equals-Enter, literal markup, text wrap) are implemented correctly but verified only by code inspection and the spec's manual checks, not by automated tests, diverging from a literal reading of every AC as an executable Vitest requirement -- same root cause and disposition as the rows above; the verbatim intent's own "Vitest tests cover..." sentence explicitly scopes mandatory automated coverage to the `core` reducer only, which is fully met.
  - `[low]` `[patch]` Blind Hunter: the "gives each new task a unique id" test only checks two ids differ and are non-empty, not that they match a UUID shape -- fixed by asserting the id against a UUID-v4-shaped regex in that test.
  - `[low]` `[patch]` Blind Hunter: no test exercises text that is over 200 characters before trimming but exactly 200 after trimming (surrounding whitespace) -- fixed by adding that boundary case to the `add/reduce` test suite.
  - `[false]` `[reject]` Blind Hunter: `reduce`'s `default` branch is untested "dead code" -- refuted: `Action` is currently a single-member union (`{ type: 'add' }`), so no type-safe caller can reach `default`; testing it would require an unsafe `as any` cast with no corresponding real-world caller, so the claimed risk never materializes.
  - `[false]` `[reject]` Blind Hunter: `handleAddSubmit`'s length-comparison growth check won't generalize to the future `toggle`/`remove` actions -- refuted: today only `add` exists, and `next.length > state.length` is a precise, correct success signal for it with no false positives/negatives; `toggle`/`remove` are explicitly out of this story's scope per its own "Never" list, so the described incompatibility cannot occur yet.
  - `[false]` `[reject]` Blind Hunter: `.task-item` CSS has no visual separator between rows -- refuted: no acceptance criterion or NFR requires inter-item separators, and the epic's own planning artifacts explicitly leave visual/layout design to the builder ("[ASSUMPTION] The visual design, layout and empty-state copy are left to the builder").
  - `[false]` `[reject]` Blind Hunter: frontmatter `warnings: ['oversized']` is unexplained in the spec body -- refuted: per the spec template, `warnings` is machine-readable orchestration metadata for the workflow tooling, not a field requiring narrative explanation in `## Spec Change Log` (which is reserved for review-loop amendments).
  - `[false]` `[reject]` Blind Hunter: no `aria-live` region announces added tasks to screen readers -- refuted: no acceptance criterion, NFR, or planning artifact requires this; the epic explicitly scopes the product to a minimal, restrained feature set beyond add/complete/delete.
  - `[false]` `[reject]` Edge Case Hunter: `crypto.randomUUID()` could throw in an insecure context or unsupported browser, failing `add()` silently -- refuted: the verbatim intent explicitly specifies `crypto.randomUUID()` as the id-generation mechanism with no fallback requirement (marked `[ASSUMPTION]`), and the scaffold targets modern evergreen browsers (`es2023`) served by Vite, which runs in secure contexts; adding defensive handling for an unrequested, effectively unreachable scenario is out of this story's scope.

## Verification

**Commands:**
- `npm test` -- expected: exits 0, including the new `add`/`reduce` Vitest cases.
- `npm run build` -- expected: exits 0 (`tsc` + `vite build`).
- `npm run dev -- --port <n> --strictPort` (brief, then stopped) -- expected: starts and serves `index.html` without throwing.

**Manual checks (if no CLI):**
- In the dev build: type "Buy rice", press Enter -- task appears at the end of the list, hint disappears, input is empty and focused. Type only spaces and press Enter -- nothing is added, input keeps its spaces and focus. Click Add with valid text -- same result as Enter. Add a task with very long text -- it wraps within the list instead of being clipped. Add `<b>hi</b>` -- the literal tag text is visible, not bold.

## Auto Run Result

**Summary:** Implemented Story 1.2. Added a pure `add`/`reduce` pair and a single `createTaskId()` id generator to `src/core/`, then wired `src/ui/screen.ts`'s previously-inert Add form to dispatch through `src/main.ts`'s store: the input is cleared and refocused only when the list actually grew, left completely untouched (including a focus restore from the Add button) when the add is rejected, and each task renders as a plain-text `<li>` in array order.

**Files changed:**
- `src/core/id.ts` -- new: `createTaskId()` wrapping `crypto.randomUUID()`, the sole id-generation point.
- `src/core/reduce.ts` -- new: `Action` type, `add(text)` action creator, `reduce(state, action)` with trim/empty/over-length guards.
- `src/core/index.ts` -- re-exports `Action`, `add`, `reduce` alongside the existing `Task`/`MAX_TASK_LENGTH` exports.
- `src/ui/screen.ts` -- `render` now takes `onAdd`/`focusInput`; submit handler dispatches and conditionally refocuses; renders one `<li class="task-item">` per task via `textContent`.
- `src/main.ts` -- `setState(next, focusInput)` and new `handleAddSubmit` connect the UI to the `core` reducer, re-rendering only when the list grows.
- `src/styles.css` -- added `.task-item` rule (padding + `overflow-wrap: anywhere`) so long task text wraps instead of clipping.
- `tests/core.test.ts` -- added an `add/reduce` describe block: append order without mutation, UUID-shaped unique ids, trimming, empty text, whitespace-only text, over-200-char rejection, exactly-200-char acceptance, and over-200-before-trim-but-exactly-200-after-trim acceptance.

**Review findings breakdown:**
- Patches applied: 2 (both `low`) -- strengthened the unique-id test to assert a UUID-v4 shape instead of only "differs and non-empty"; added a boundary test for text that is over `MAX_TASK_LENGTH` before trimming but exactly `MAX_TASK_LENGTH` after.
- Items deferred: 1 (`medium`) -- no automated test exercises `src/ui/screen.ts` or `src/main.ts` (covers three reviewer findings with the same root cause: untested `li`/`textContent`/order rendering, untested reject-vs-grow focus gating, and the Intent Alignment Auditor's divergence report). Pre-existing limitation from Story 1.1 (no DOM test environment configured); recorded in frontmatter `deferred`.
- Rejected: 6, all verdict `false` -- see `## Review Triage Log` for each finding and its refutation. In summary: the reducer's unreachable `default` branch poses no real risk under the current single-member `Action` union; the length-based growth check is correct for this story's scope and the `toggle`/`remove` concern is speculative about stories not yet implemented; no AC or NFR requires inter-item visual separators (the epic explicitly leaves visual design to the builder); the `oversized` frontmatter warning is machine-readable orchestration metadata, not something requiring body narration; no AC or NFR requires `aria-live` accessibility announcements; and `crypto.randomUUID()` is the intent's own explicitly specified mechanism with no fallback requirement.

**Follow-up review recommendation:** `false`. Both patched entries were `low` severity (test-coverage strengthening, not code defects), which does not meet the bar (a patched `high`, or two or more patched `medium` entries) for recommending another review pass.

**Verification performed:**
- `npm test` -- exit 0, 10/10 tests passed (both before and after the two patches).
- `npm run build` -- exit 0, emitted `dist/index.html`, `dist/assets/*.css`, `dist/assets/*.js` (re-run after patches, still exit 0).
- `npm run dev -- --port 5178 --strictPort` -- started cleanly, served the root page with HTTP 200.
- Diff since baseline (`598382b`) read directly from a unified diff file: confirms changes land exactly on the files the spec's Code Map lists, nothing else.
- Four independent review layers (Blind Hunter, Edge Case Hunter, Verification Gap, Intent Alignment Auditor) run in parallel against the diff: 12 findings total, triaged to 2 patches (low), 1 deferred group (medium, 4 rows), 6 rejected (false).
- UI-level matrix rows without DOM-test coverage (focus/clear/hint visibility, literal markup rendering, button-click focus restore, text wrapping) verified by direct code inspection: `item.textContent = task.text` (never `innerHTML`), the `onAdd`/`focusInput` control flow traced end-to-end, and `input.maxLength = MAX_TASK_LENGTH` confirmed unchanged from Story 1.1.

**Residual risks:** No automated (Vitest/DOM) test exercises `src/ui/screen.ts` or `src/main.ts`, so a future regression in task rendering, focus handling, or the reject-vs-grow gating would not be caught by `npm test` -- recorded in frontmatter `deferred` (severity `medium`). This mirrors the same accepted limitation from Story 1.1 and would need a DOM-capable test environment (e.g. `jsdom`/`happy-dom`) to close, which is beyond this story's scope.
