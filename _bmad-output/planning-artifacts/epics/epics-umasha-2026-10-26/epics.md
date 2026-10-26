---
status: final
created: 2026-10-26
updated: 2026-10-26
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-umasha-2026-10-26/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-umasha-2026-10-26/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/briefs/brief-umasha-2026-10-26/brief.md
---

# umasha - Epic Breakdown

Items tagged `[ASSUMPTION]` were inferred, not confirmed. Correct any that are wrong.

## Overview

This document provides the complete epic and story breakdown for umasha, decomposing the requirements from the PRD and Architecture spine into implementable stories.

`[ASSUMPTION]` The PRD, architecture spine and product brief are the full set of inputs. No UX design document exists, so UI rules come from PRD FR-1 to FR-5 and architecture decision AD-6.

## Requirements Inventory

### Functional Requirements

FR1: The user can Add a Task by entering text and confirming with the Enter key or an Add control. The new Task appears at the end of the List as Open. The input is cleared and keeps focus. Leading and trailing whitespace is removed. Empty or whitespace-only text adds nothing. `[ASSUMPTION]` Text over 200 characters is rejected by the input limit, and shorter text wraps in the list.

FR2: The user can Complete a Task with a single click or tap on it, and reverse it the same way. A Done Task is shown struck through and dimmed, not by color alone. Completing a Task does not change its position in the List.

FR3: The user can Delete any Task, Open or Done, with one action on that Task. The Task is removed immediately. `[ASSUMPTION]` No confirmation and no undo. The delete control is separate from the Complete action.

FR4: The Screen always shows every Task in the List, scrolling if long. `[ASSUMPTION]` An empty List shows a short hint inviting the user to add a Task.

FR5: The List persists on the user's device across page reloads and browser restarts, with each Task's text, state and order unchanged. `[ASSUMPTION]` Storage is local to the browser and no Task data is sent to a server. `[ASSUMPTION]` If local storage is unavailable, the app works for the session and loses the List on reload, with no error shown.

### NonFunctional Requirements

NFR1 (Responsive): The Screen is usable from about 320 px phone width to desktop with no horizontal scrolling. `[ASSUMPTION]`

NFR2 (Accessible): Every action works from the keyboard. Controls have text labels available to assistive technology. Text contrast meets WCAG 2.1 AA. `[ASSUMPTION]`

NFR3 (Fast): Add, Complete and Delete show their result in under 100 ms on an ordinary device. `[ASSUMPTION]`

NFR4 (Private): The product collects no personal data and makes no network calls with Task data.

NFR5 (Browsers): Current versions of the major evergreen browsers. `[ASSUMPTION]`

### Additional Requirements

- Starter template: scaffold with the `create-vite` `vanilla-ts` template (create-vite 9.3.1). This drives Epic 1 Story 1. If the template pins a different working TypeScript version, keep the template's version. `[ASSUMPTION]` per the architecture spine.
- Stack: TypeScript 7.0.2, Vite 8.3.5, Vitest 5.0.5, Node.js ^22.12.0 or ^24 for tooling only. No UI framework and no runtime dependency.
- AD-1: The List changes only through a pure `reduce(state, action)` in `src/core/`. Actions are `add(text)`, `toggle(id)` and `remove(id)`. The UI never edits a Task or the List directly.
- AD-2: `Task = { id: string, text: string, done: boolean }`. State is `Task[]` and array order is list order. Add appends, toggle changes only `done`, remove deletes the element, nothing reorders. `id` comes from one function in `core`, using `crypto.randomUUID()` `[ASSUMPTION]`.
- AD-3: `core` exports `MAX_TASK_LENGTH = 200`. The `add` action trims, and ignores empty or over-length text. The input `maxlength` reads the same constant. The input is cleared only when the List actually grew.
- AD-4: Only `src/storage/` touches localStorage, using the single key `umasha.tasks.v1`. Read once at startup, written by one subscriber after every state change. All storage errors are swallowed. Invalid stored data is treated as an empty List `[ASSUMPTION]`.
- AD-5: Task text reaches the DOM only through `textContent` or `value`. No `innerHTML`, `outerHTML` or `insertAdjacentHTML` with Task data.
- AD-6: The List is a `ul` with one `li` per Task. Complete is a native checkbox labelled by the Task text. Delete is a separate native `button` with an `aria-label` that includes the Task text. Add is a `form` with a text input and a submit button. Done is shown with strike-through and dimming. No fixed widths that force horizontal scrolling at 320 px.
- AD-7: The product builds to static files. No backend, API, analytics, remote fonts or remote scripts. Each action re-renders the List fully from state.
- Layering: `core` imports nothing from the app or the browser. `ui` and `storage` never import each other. `src/main.ts` composes the store, UI and storage.
- Conventions: files `kebab-case.ts`, types `PascalCase`, functions and variables `camelCase`, constants `UPPER_SNAKE_CASE`. Immutable updates. No logging, config or environment variables in v1.
- Tests: Vitest unit tests for `core` and `storage` (against a fake storage object). The UI is covered by a short manual checklist drawn from PRD SM-1 to SM-4. `[ASSUMPTION]` No end-to-end framework in v1.
- Deployment: local development with `vite` and one production static build. Hosting is deferred and no pipeline is required in v1.

### UX Design Requirements

No UX design document exists for umasha, so there are no UX-DR items.
`[ASSUMPTION]` The visual design, layout and empty-state copy are left to the builder within the AD-6 control structure and the PRD NFRs.

### FR Coverage Map

FR1: Epic 1 - Add a Task by Enter or Add control, with trimming, empty rejection and the 200 character limit
FR2: Epic 1 - Complete and un-complete a Task with one click, shown struck through and dimmed
FR3: Epic 1 - Delete any Task with one separate action
FR4: Epic 1 - Show every Task in the List, with an empty-state hint
FR5: Epic 2 - Keep the List between visits in browser storage, failing silently

NFR1 (Responsive): Epic 3 - Story 3.1
NFR2 (Accessible): Epic 3 - Story 3.2, with control structure built in Epic 1
NFR3 (Fast): Epic 3 - Story 3.3
NFR4 (Private): Epic 3 - Story 3.3, with storage rules in Epic 2
NFR5 (Browsers): Epic 3 - Story 3.3

`[ASSUMPTION]` Three epics are enough. The design is fully settled in the architecture spine, so the epics are few and larger, split only where a real value boundary exists: using the list, keeping the list, and making it comfortable on any device. Epic 3 revisits `ui` and `styles.css` from Epic 1 on purpose: it is a cross-cutting pass for the NFRs that needs the working screen to measure against, so it is kept separate from the feature stories rather than merged into them.

## Epic List

### Epic 1: Capture and clear my tasks on one screen
The user can open the app, add tasks, mark them done or not done, and delete them, all on a single screen with a hint when the list is empty.
**FRs covered:** FR1, FR2, FR3, FR4

### Epic 2: Keep my list between visits
The user closes the tab or browser and finds the list exactly as left, with no server and no errors if browser storage is unavailable.
**FRs covered:** FR5

### Epic 3: Comfortable on any device and input
The user can use the screen on a 320 px phone or a desktop, with a keyboard or a screen reader, and gets instant feedback, with the build verified as static and private.
**FRs covered:** none new; addresses NFR1 to NFR5

## Epic 1: Capture and clear my tasks on one screen

The user can open the app, add tasks, mark them done or not done, and delete them, all on a single screen with a hint when the list is empty.

`[ASSUMPTION]` Story sizes and ordering are my own. Each story builds only on earlier stories.

### Story 1.1: Open the app and see an empty screen

As a user,
I want to open umasha and see one screen with a place to type and a hint to add my first task,
So that I know what to do without any instructions.

**Acceptance Criteria:**

**Given** an empty project folder
**When** the project is scaffolded with the `create-vite` `vanilla-ts` template and arranged as `src/main.ts`, `src/core/`, `src/storage/`, `src/ui/`, `src/styles.css` and `tests/`
**Then** `npm run dev`, `npm run build` and `npm test` each run without error
**And** Vitest is configured and there are no runtime dependencies beyond the shipped TypeScript and CSS
**And** if the template pins a different working TypeScript version than 7.0.2, the template's version is kept

**Given** the app starts with an empty List
**When** the page loads
**Then** the Screen shows a text input, an Add button and a short hint inviting the user to add a Task
**And** no Task rows are shown
**And** `[ASSUMPTION]` the hint reads "No tasks yet. Add one above."
**And** the form is a placeholder in this story: submitting it does nothing yet, and its behaviour is built in Story 1.2

**Given** the code is organised by layer
**When** `src/core/` is inspected
**Then** it exports the `Task` type `{ id: string, text: string, done: boolean }` and the `MAX_TASK_LENGTH` constant set to 200
**And** it imports nothing from the browser or from `ui`, `storage` or `main`
**And** `src/main.ts` holds the single store, with state `Task[]`, and re-renders the Screen from state whenever state changes (AD-1, AD-2, AD-7)

**Given** a passing Vitest test exists for `core`
**When** `npm test` runs
**Then** it passes, proving the test setup works

### Story 1.2: Add a task

As a user,
I want to type a task and add it with Enter or a button,
So that I can capture it in seconds.

**Acceptance Criteria:**

**Given** the List is empty or holds Tasks
**When** I type "Buy rice" and press Enter
**Then** a new Open Task "Buy rice" appears at the end of the List
**And** the empty-state hint is no longer shown
**And** the input is cleared and keeps focus (FR1, FR4)

**Given** I have typed text
**When** I click or tap the Add button
**Then** the result is the same as pressing Enter (the Add control is a `form` submit button, AD-6)

**Given** I type "  Call the bank  " with leading and trailing spaces
**When** I confirm
**Then** the Task is saved as "Call the bank" with the spaces removed

**Given** the input is empty or contains only whitespace
**When** I confirm
**Then** no Task is added
**And** the input keeps focus
**And** the typed whitespace is not cleared, because the input is cleared only when the List actually grew (AD-3)

**Given** the input
**When** the page is inspected
**Then** its `maxlength` attribute equals `MAX_TASK_LENGTH` (200), read from the same constant
**And** the `add` action in `core` also ignores text longer than 200 characters after trimming, so the rule holds without the browser

**Given** a Task whose text is longer than the visible width
**When** it is shown
**Then** the text wraps onto multiple lines and is not cut off

**Given** I add a Task whose text is `<b>hi</b>`
**When** it is shown
**Then** the literal characters `<b>hi</b>` are displayed and no markup is parsed (AD-5)

**Given** the `core` reducer
**When** `add` is applied to a state
**Then** it returns a new array and does not mutate the old one
**And** each new Task gets a unique `id` from one function in `core`, using `crypto.randomUUID()` `[ASSUMPTION]`
**And** Vitest tests cover append order, trimming, empty text, whitespace-only text, text over 200 characters and text of exactly 200 characters

### Story 1.3: Mark a task done and not done

As a user,
I want to click a task to mark it done, and click it again to undo,
So that I can see what is left.

**Acceptance Criteria:**

**Given** an Open Task in the List
**When** I click or tap the Task text or its checkbox
**Then** the Task becomes Done and is shown with struck-through, dimmed text (FR2)
**And** the Done state does not rely on color alone

**Given** a Done Task
**When** I click or tap it again
**Then** it returns to Open and its text is shown normally

**Given** several Tasks
**When** I complete or un-complete one of them
**Then** every Task keeps its position in the List
**And** no other Task changes

**Given** the markup of a Task row
**When** it is inspected
**Then** Complete is a native checkbox whose label is the Task text, inside an `li` of a `ul` (AD-6)

**Given** the `core` reducer
**When** `toggle(id)` is applied
**Then** only the `done` field of the matching Task flips, in place, and a new array is returned
**And** an unknown `id` leaves the List unchanged
**And** Vitest tests cover flip to Done, flip back to Open, unknown `id`, unchanged order and no mutation of the old state

### Story 1.4: Delete a task

As a user,
I want to delete a task with one action,
So that my list stays clear of things that no longer matter.

**Acceptance Criteria:**

**Given** any Task, Open or Done
**When** I click or tap its Delete button
**Then** the Task is removed from the List immediately (FR3)
**And** no confirmation dialog is shown and no undo is offered `[ASSUMPTION]`

**Given** a Task row
**When** it is inspected
**Then** Delete is a separate native `button`, not part of the checkbox or its label
**And** it has an `aria-label` that includes the Task text, such as "Delete Buy rice" (AD-6)

**Given** I click the Task text to complete it
**When** the click lands on the text or checkbox
**Then** the Task is not deleted

**Given** a List with Tasks A, B and C
**When** I delete B
**Then** A and C remain in their original order with their states unchanged

**Given** I delete the last remaining Task
**When** the List becomes empty
**Then** the empty-state hint is shown again (FR4)

**Given** the `core` reducer
**When** `remove(id)` is applied
**Then** the matching Task is removed and a new array is returned
**And** an unknown `id` leaves the List unchanged
**And** Vitest tests cover removing an Open Task, a Done Task, the only Task, an unknown `id` and no mutation of the old state

## Epic 2: Keep my list between visits

The user closes the tab or browser and finds the list exactly as left, with no server and no errors if browser storage is unavailable.

### Story 2.1: See my list again after a reload

As a user,
I want my tasks to still be there when I reopen the app,
So that I can trust it as my list.

**Acceptance Criteria:**

**Given** I have Tasks in the List
**When** any state change happens (add, complete, un-complete or delete)
**Then** the full List is written as a JSON array of `Task` to the single localStorage key `umasha.tasks.v1`
**And** one subscriber in `main.ts` performs the write, and no other code writes to storage (AD-4)

**Given** the stored List holds Tasks
**When** the page is reloaded or the browser is restarted
**Then** the List is read once at startup, before the first render
**And** every Task is present with its text, Done state and order unchanged (FR5)

**Given** the code is inspected
**When** imports are checked
**Then** `src/storage/` is the only code that touches localStorage
**And** `storage` imports only from `core`, and `ui` and `storage` do not import each other

**Given** Vitest tests that use a fake storage object
**When** they run
**Then** they cover saving, loading an empty store, and a round trip of Tasks that keeps text, state and order
**And** no network request carries Task data (NFR4)

### Story 2.2: Keep working when storage fails or is corrupt

As a user,
I want the app to keep working even if my browser blocks storage or the saved data is damaged,
So that I never see a broken screen.

**Acceptance Criteria:**

**Given** localStorage is unavailable, blocked or full
**When** the app starts or the List changes
**Then** the app continues to work for the current session
**And** no error or message is shown to the user
**And** after a reload the List is empty `[ASSUMPTION]` (FR5)

**Given** the stored value is not valid JSON
**When** the app starts
**Then** it starts with an empty List and does not crash

**Given** the stored value is valid JSON but is not an array of valid Tasks (wrong shape, missing fields or wrong types)
**When** the app starts
**Then** it starts with an empty List `[ASSUMPTION]`
**And** the damaged value is replaced the next time the List changes

**Given** Vitest tests that use a fake storage object that throws on read or write
**When** they run
**Then** they cover a throwing read, a throwing write, invalid JSON, a non-array value and an array with an invalid item
**And** none of them lets an error escape from `storage`

## Epic 3: Comfortable on any device and input

The user can use the screen on a 320 px phone or a desktop, with a keyboard or a screen reader, and gets instant feedback, with the build verified as static and private.

### Story 3.1: Use it on a phone or a desktop

As a user,
I want the screen to fit my phone or my desktop,
So that I can use it wherever I am.

**Acceptance Criteria:**

**Given** a viewport width of 320 px
**When** the Screen is shown with an empty List and with a long List
**Then** there is no horizontal scrolling (NFR1)

**Given** a Task with a very long unbroken word
**When** it is shown at 320 px
**Then** the text wraps within the row and does not push the layout wider than the viewport

**Given** a wide desktop viewport
**When** the Screen is shown
**Then** the layout stays readable, `[ASSUMPTION]` with the content in a centered column of limited width

**Given** a long List
**When** it exceeds the viewport height
**Then** the page scrolls so that every Task can be reached, with no Task cut off (FR4)

**Given** the page head
**When** it is inspected
**Then** it declares a responsive viewport, and no control uses a fixed width that forces horizontal scrolling (AD-6)
**And** `[ASSUMPTION]` the Add and Delete buttons have a touch target of at least 44 by 44 CSS pixels

### Story 3.2: Use it with a keyboard and a screen reader

As a user who does not use a mouse or touch,
I want every action to work from the keyboard and be announced clearly,
So that I can use the app on equal terms.

**Acceptance Criteria:**

**Given** the Screen
**When** I use only the keyboard
**Then** I can focus the input, add a Task with Enter, toggle a Task with Space on its checkbox, and delete a Task with Enter or Space on its Delete button (NFR2)
**And** the tab order follows the visual order: input, Add, then each Task's checkbox and Delete button

**Given** any focusable control
**When** it has focus
**Then** a visible focus indicator is shown

**Given** a screen reader
**When** it reaches a Task row
**Then** the checkbox is announced with the Task text and its checked state
**And** the Delete button is announced with a name that includes the Task text
**And** the text input has an accessible label

**Given** the colors in use
**When** contrast is measured
**Then** all text, including dimmed Done text, meets WCAG 2.1 AA contrast of at least 4.5:1 `[ASSUMPTION]`
**And** the strike-through remains on Done Tasks so that the state does not rely on color alone

### Story 3.3: Verify speed, privacy and the static build

As a user,
I want the app to respond instantly and keep my tasks on my own device,
So that I can trust it with my notes.

**Acceptance Criteria:**

**Given** the project
**When** `npm run build` is run
**Then** it produces static files only, with no backend, API or analytics (AD-7)
**And** the built page loads no remote fonts or scripts

**Given** the built app is opened with the browser network panel recording
**When** I add, complete and delete Tasks
**Then** no network request carries Task data after the initial page load (NFR4)

**Given** a List of `[ASSUMPTION]` 200 Tasks on an ordinary device
**When** I add, complete or delete a Task
**Then** the result is shown in under 100 ms (NFR3)

**Given** a short manual checklist saved at `tests/manual-checklist.md` `[ASSUMPTION]`
**When** it is run against the production build
**Then** it confirms PRD SM-1 (a first-time user can add, complete and delete without instructions), SM-2 (the List survives a reload), SM-3 (each action takes one step) and SM-4 (the whole product fits on one Screen)
**And** it confirms the app works in the current versions of Chrome, Firefox, Edge and Safari, or notes which of these were not available to test `[ASSUMPTION]` (NFR5)
