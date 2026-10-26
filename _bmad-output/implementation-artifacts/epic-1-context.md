# Epic 1 Context: Capture and clear my tasks on one screen

<!-- Generated from planning artifacts. Regenerate with compile-epic-context if planning docs change. -->

## Goal

This epic delivers the core, usable todo experience on a single screen: a person can open the app, add tasks, mark them done or not done, delete them, and always see the full current list (with a hint when it is empty). It is the foundation the rest of the product sits on — persistence (Epic 2) and the responsive/accessible/performance pass (Epic 3) both build on the control structure, state model and rendering established here. The product's value is restraint: nothing beyond these three actions on one screen.

## Stories

- Story 1.1: Open the app and see an empty screen
- Story 1.2: Add a task
- Story 1.3: Mark a task done and not done
- Story 1.4: Delete a task

## Requirements & Constraints

- Adding a task: confirm via Enter or an Add control; the new task appears Open at the end of the list; leading/trailing whitespace is trimmed; empty or whitespace-only input adds nothing and keeps focus without clearing; the input is cleared and refocused only when the list actually grew. Input is capped at 200 characters (shared constant), enforced both in the UI and in the underlying logic; text under the limit wraps rather than being cut off.
- Completing: a single click/tap on a task (or its checkbox) toggles it between Open and Done; the reverse action un-completes it the same way. A Done task is shown struck through and dimmed — the distinction must not rely on color alone. Toggling never changes a task's position in the list, and never affects other tasks.
- Deleting: a single, separate action removes any task (Open or Done) immediately, with no confirmation and no undo. It must be impossible for a delete to fire as a side effect of completing a task.
- Display: every task is always visible on the one screen (list scrolls if long); an empty list shows a short inviting hint instead of a blank area (assumed copy: "No tasks yet. Add one above.").
- Task text must never be interpreted as markup — what the user types is what is displayed, literally.
- No accounts, settings, multi-list, editing-after-add, due dates, or other scope beyond add/complete/delete on one list.

## Technical Decisions

- Functional core / imperative shell: all task-state changes go through one pure `reduce(state, action)` in `src/core/`, with actions `add(text)`, `toggle(id)`, `remove(id)`. UI code only dispatches actions; it never mutates a task or the list directly. The reducer always returns a new array (immutable updates), never mutates the old one.
- Data model: `Task = { id: string, text: string, done: boolean }`; state is `Task[]` and array order is list order. Add appends; toggle flips only `done` in place; remove deletes the matching element; nothing else reorders. `id` generation lives in exactly one function in `core` (uses `crypto.randomUUID()`).
- Validation lives only in `core`: it exports `MAX_TASK_LENGTH = 200`; `add` trims text and ignores it if empty or over the limit after trimming. The input's `maxlength` attribute reads this same constant so browser and logic agree.
- Task text reaches the DOM only via `textContent`/`value` — never `innerHTML`, `outerHTML`, or `insertAdjacentHTML`.
- Fixed control structure: the list is a `ul` with one `li` per task; Complete is a native checkbox labelled by the task text; Delete is a separate native `button` carrying an `aria-label` that includes the task text; Add is a `form` with a text input and submit button (so Enter works for free).
- Each action triggers a full re-render of the list from state (accepted approach at this scale; informs the performance work in Epic 3).
- Project layering: `core` imports nothing from the browser, UI, storage or `main`; `ui` and `storage` never import each other; `src/main.ts` composes the single store, UI and storage. Layout: `src/main.ts`, `src/core/`, `src/storage/`, `src/ui/`, `src/styles.css`, `tests/`.
- Stack/scaffold: `create-vite` `vanilla-ts` template, TypeScript ~7.0.2 (keep the template's pinned version if different), Vite ~8.3.5, Vitest ~5.0.5, no runtime dependencies beyond shipped TS/CSS. `npm run dev`, `npm run build`, and `npm test` must each succeed, with at least one passing Vitest test proving the test setup works.
- Conventions: files `kebab-case.ts`; types `PascalCase`; functions/variables `camelCase`; constants `UPPER_SNAKE_CASE`.
- Vitest unit tests cover `core` directly (append order, trim, empty/whitespace/over-length/exactly-200-length text, toggle on known/unknown id, remove on known/unknown id, no mutation of prior state).

## UX & Interaction Patterns

No formal UX design document exists; visual design, layout and empty-state copy are left to the builder within the control structure above. Key constraints: Done state must be conveyed by strike-through plus dimming, not color alone; the empty-state hint replaces the list area rather than leaving it blank; the Add control is a standard form submit so both Enter and clicking the button behave identically.

## Cross-Story Dependencies

Story 1.1 establishes the project scaffold, the `core` Task type/store and the base render loop that Stories 1.2–1.4 extend with real behavior (add, toggle, remove). Epic 2 (persistence) depends on the `add`/`toggle`/`remove` actions and `Task[]` shape defined here. Epic 3 revisits this epic's `ui`/`styles.css` for responsiveness, accessibility and performance rather than changing the control structure or state model.
