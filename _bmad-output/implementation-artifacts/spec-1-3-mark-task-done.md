---
title: 'Story 1.3: Mark a task done and not done'
type: 'feature'
created: '2026-10-26'
status: 'in-progress'
baseline_revision: '8247ccbcaade21f41a0e9f47fa8e0adffaaad1a1'
review_loop_iteration: 0
followup_review_recommended: false
context: ['_bmad-output/implementation-artifacts/epic-1-context.md']
warnings: ['oversized']
deferred: []
---

<intent-contract>

## Intent

**Problem:** Tasks render as plain-text `<li>`s (Story 1.2) with no way to mark one Done or back to Open, so the list can never show what is finished.

**Approach:** Add a pure `toggle(id)` action/reducer case to `src/core/`, then render each task as a native checkbox labelled by its text inside the `li`, wired through `src/main.ts` so a click/tap on the checkbox or its label text flips `done` and re-renders with a struck-through, dimmed style for Done tasks.

## Boundaries & Constraints

**Always:**
- `src/core/reduce.ts`'s `Action` union gains `{ type: 'toggle'; id: string }` and action creator `toggle(id: string): Action`. `reduce`'s `toggle` case finds the task with matching `id`: if found, returns a new array with only that element replaced by `{ ...task, done: !task.done }` (same position, all other elements the same references, old array untouched); if no task matches, returns the same `state` reference unchanged.
- `src/core/index.ts` re-exports `toggle` alongside the existing `Action`/`add`/`reduce`/`Task`/`MAX_TASK_LENGTH` exports.
- `src/ui/screen.ts`'s `render` renders each task as `<li class="task-item">` containing one `<label>` that wraps a native `<input type="checkbox">` (`checked = task.done`) followed by a text node/span holding `task.text` (via `textContent`, never `innerHTML`) -- the checkbox's native label association is what makes clicking the task text toggle it (AD-6). The checkbox's `change` handler calls a new `onToggle(task.id)` param.
- When `task.done` is `true`, the `li` (or its text element) gets a CSS class that applies both `text-decoration: line-through` and a dimmed opacity/color -- two independent visual cues, so Done is never conveyed by color alone.
- `src/main.ts` adds `handleToggle(id: string): void` that computes `reduce(state, toggle(id))` and calls `setState(next)` (no `focusInput`), and passes it into `render` as the new `onToggle` argument.
- Toggling any task preserves every task's array position; no other task's fields change.

**Never:**
- Do not add a Delete button or `remove` action/reducer case -- that is Story 1.4.
- Do not use `innerHTML`/`outerHTML`/`insertAdjacentHTML` anywhere task text flows.
- Do not give the Done state a color-only indicator (e.g. text color change alone) -- strike-through is mandatory alongside dimming.
- Do not change `add`'s behavior, the Add form, or `src/core/task.ts`/`src/core/id.ts`.
- Do not mutate the `state` array or any existing `Task` object in place.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Toggle Open to Done | state has task `{id: 'a', done: false}` among others, `toggle('a')` | returns new array; task `'a'` now `done: true`; all other tasks unchanged and at the same index | No error expected |
| Toggle Done back to Open | state has task `{id: 'a', done: true}`, `toggle('a')` | returns new array; task `'a'` now `done: false` | No error expected |
| Unknown id | state non-empty, `toggle('missing')` | `reduce` returns the same `state` reference; no task changed | No task changed, no re-render |
| Multiple tasks | state `[a, b, c]`, `toggle(b.id)` | result array is `[a, b', c]` in the same order; `a` and `c` are the exact same object references as before | No error expected |
| No mutation | state `[{id:'a', done:false}]` captured before `toggle('a')` | the pre-call array and its element are unchanged after the call (new array/object returned instead) | No error expected |

</intent-contract>

## Code Map

- `src/core/task.ts` -- EXISTS: `Task = { id, text, done }`. Unchanged.
- `src/core/reduce.ts` -- EXISTS (`src/core/reduce.ts:1-24`): `Action` currently `{ type: 'add'; text: string }` only; `reduce`'s `switch` has an `add` case and a `default: return state`. Change: widen `Action` to `{ type: 'add'; text: string } | { type: 'toggle'; id: string }`, add `toggle(id: string): Action` action creator, and add a `toggle` case to the `switch` before `default` implementing the find/replace-one-element logic described above (use `state.findIndex`, then `state.slice()` + single-index replace -- mirrors the existing immutable-update style of the `add` case).
- `src/core/index.ts` -- EXISTS (`src/core/index.ts:1-4`), barrel: add `toggle` to the existing `export { add, reduce } from './reduce.ts'` line.
- `src/ui/screen.ts` -- EXISTS (`src/ui/screen.ts:1-66`): the task-rendering loop (`src/ui/screen.ts:54-59`) currently does `const item = document.createElement('li'); item.className = 'task-item'; item.textContent = task.text; list.append(item)`. Change: accept a new `onToggle: (id: string) => void` param (after `onAdd`, before `focusInput` -- keep `focusInput` last since callers pass it positionally with a default); replace the loop body to build `<li class="task-item">` containing a `<label>` with a `<input type="checkbox">` (`checked = task.done`, `addEventListener('change', () => onToggle(task.id))`) and a `<span class="task-text">` (`textContent = task.text`); toggle a `done` class on the `li` (or the span) when `task.done` is true.
- `src/main.ts` -- EXISTS (`src/main.ts:1-23`): `setState`/`handleAddSubmit` already established; `render(root, state, handleAddSubmit, focusInput)` call site at `src/main.ts:11`. Change: add `handleToggle(id: string): void { setState(reduce(state, toggle(id))) }`, import `toggle` from `./core/index.ts`, and pass `handleToggle` into the `render(...)` call (`src/main.ts:11`) in the new `onToggle` position.
- `src/styles.css` -- EXISTS: `.task-item` rule at `src/styles.css:59-62` has no Done-state styling yet, and no `label`/checkbox styling exists for list rows. Add a rule for the Done state (e.g. `.task-item.done .task-text { text-decoration: line-through; opacity: 0.6; }`) and a minimal `label`/checkbox layout rule (flex row, small gap) so the checkbox and text sit inline.
- `tests/core.test.ts` -- EXISTS (`tests/core.test.ts:1-89`): has an `add/reduce` describe block; add a sibling `describe('toggle/reduce', ...)` per Tasks below. Import `toggle` alongside the existing `add`/`MAX_TASK_LENGTH`/`reduce`/`Task` imports.

## Tasks & Acceptance

**Execution:**
- `src/core/reduce.ts` -- widen `Action`, add `toggle(id)` creator and the `toggle` reducer case -- pure, in-place-field-flip state transition per AD-2/AD-7.
- `src/core/index.ts` -- re-export `toggle` -- keeps `core`'s public surface as one barrel.
- `src/ui/screen.ts` -- render each task as a checkbox-labelled `li`, wire `onToggle` -- satisfies AD-6's native-checkbox-in-`li`-of-`ul` markup and FR2's click-to-complete.
- `src/main.ts` -- add `handleToggle`, pass it into `render` -- connects the checkbox's `change` event to the `core` reducer while keeping `main.ts` the sole store owner (AD-1, AD-7).
- `src/styles.css` -- add Done-state (strike-through + dim) and checkbox/label layout rules -- satisfies the no-color-alone acceptance criterion.
- `tests/core.test.ts` -- cover `toggle`/`reduce` edge cases -- satisfies the AC's explicit Vitest coverage list.

**Acceptance Criteria:**
- Given an Open Task in the List, when I click or tap the Task text or its checkbox, then the Task becomes Done and is shown with struck-through, dimmed text, and the Done state does not rely on color alone.
- Given a Done Task, when I click or tap it again, then it returns to Open and its text is shown normally.
- Given several Tasks, when I complete or un-complete one of them, then every Task keeps its position in the List and no other Task changes.
- Given the markup of a Task row, when it is inspected, then Complete is a native checkbox whose label is the Task text, inside an `li` of a `ul`.
- Given the `core` reducer, when `toggle(id)` is applied, then only the `done` field of the matching Task flips, in place, and a new array is returned; an unknown `id` leaves the List unchanged (same `state` reference); and Vitest tests cover flip to Done, flip back to Open, unknown `id`, unchanged order, and no mutation of the old state.

## Spec Change Log

## Review Triage Log

## Verification

**Commands:**
- `npm test` -- expected: exits 0, including the new `toggle`/`reduce` Vitest cases.
- `npm run build` -- expected: exits 0 (`tsc` + `vite build`).
- `npm run dev -- --port <n> --strictPort` (brief, then stopped) -- expected: starts and serves `index.html` without throwing.

**Manual checks (if no CLI):**
- In the dev build: add two or three tasks. Click a middle task's text -- it becomes struck-through and dimmed, stays in the same position, and the other tasks are untouched. Click it again -- it returns to normal text. Click directly on its checkbox instead of the text -- same toggle behavior either way. Inspect the DOM -- each row is an `li` containing a `label` wrapping an `input type="checkbox"` and the task text.
