---
title: "PRD: umasha"
status: final
created: 2026-10-26
updated: 2026-10-26
stepsCompleted: [discovery, draft, finalize]
inputs:
  - _bmad-output/planning-artifacts/briefs/brief-umasha-2026-10-26/brief.md
---

# PRD: umasha

Working title: umasha. Items tagged `[ASSUMPTION]` were inferred, not confirmed. Correct any that are wrong.

## 0. Document Purpose

This PRD defines v1 of umasha, a single-screen todo app. It is written for the builder and for downstream workflow owners (UX, architecture, epics and stories). It builds on the product brief at `_bmad-output/planning-artifacts/briefs/brief-umasha-2026-10-26/brief.md` and does not repeat it. Vocabulary is anchored in the Glossary. Features are grouped with numbered FRs nested under them, and every assumption is tagged inline and indexed in section 9.

Stakes are low (personal project), so the document is kept short.

## 1. Vision

umasha is a todo list that is faster to use than a sticky note. A person types a task, adds it, marks it done, and deletes it when it is no longer needed. There is one screen, no accounts, no settings and nothing to learn.

The value is restraint. Many todo apps exist, and umasha does not compete on features. It competes on how little stands between the person and their list. If a proposed addition makes the screen more complicated, it does not belong.

## 2. Target User

### 2.1 Jobs To Be Done

- When I think of something I must not forget, I want to capture it in seconds so it is out of my head.
- When I finish something, I want to mark it done so I can see what is left.
- When a task no longer matters, I want to remove it so the list stays clear.
- `[ASSUMPTION]` For the builder, this is also a small, finishable project that stays small.

### 2.2 Non-Users (v1)

- Teams or anyone who needs to share or assign tasks.
- People who need the same list on several devices.
- People who need reminders, due dates or project planning.

### 2.3 Key User Journeys

- **UJ-1. Nimali clears her day's list.**
  - **Persona + context:** `[ASSUMPTION]` Nimali, an individual with a handful of small errands today, wants a quick personal checklist. The name is illustrative.
  - **Entry state:** She opens umasha in a browser on her phone. The list may be empty or hold tasks from earlier.
  - **Path:** She types "Buy rice" and confirms. The task appears in the list. Later she taps "Buy rice" and it shows as done. She adds "Call the bank", then decides it is no longer needed and deletes it.
  - **Climax:** She glances at the screen and sees exactly what is left, with nothing else competing for attention.
  - **Resolution:** She closes the tab. When she reopens it tomorrow, the list is as she left it.
  - **Edge case:** She taps Add with an empty input. Nothing is added and the input keeps focus.

## 3. Glossary

- **Task**: One line of text the user wants to remember to do. Has a state of Open or Done. The List holds zero or more Tasks.
- **List**: The ordered collection of all Tasks, shown on the Screen.
- **Open**: The state of a Task that is not yet done.
- **Done**: The state of a Task the user has marked complete. A Done Task stays in the List.
- **Add**: The action that creates a new Open Task from entered text.
- **Complete**: The action that sets a Task to Done. Using it on a Done Task sets it back to Open (un-complete).
- **Delete**: The action that permanently removes a Task from the List.
- **Screen**: The single view that contains the whole product.

## 4. Features

### 4.1 Task List

**Description:** The Screen shows an input for new Tasks and the List beneath it. Each Task in the List shows its text, a way to Complete it and a way to Delete it. The user can do all three actions without leaving the Screen. Realizes UJ-1. `[ASSUMPTION]` Tasks are shown in the order they were added, oldest first, and a Done Task keeps its position rather than moving.

**Functional Requirements:**

#### FR-1: Add a Task

The user can Add a Task by entering text and confirming with the Enter key or an Add control. Realizes UJ-1.

**Consequences (testable):**
- After confirming, the new Task appears at the end of the List as Open.
- The input is cleared and keeps focus so the user can enter another Task.
- Leading and trailing whitespace is removed from the text before it is saved.
- Confirming with empty or whitespace-only text adds nothing.
- `[ASSUMPTION]` Text longer than 200 characters is rejected by the input limit. Text under the limit wraps onto multiple lines rather than being cut off.

#### FR-2: Complete and un-complete a Task

The user can Complete a Task with a single click or tap on it, and can reverse it the same way. Realizes UJ-1.

**Consequences (testable):**
- A Done Task is visibly different from an Open Task, with its text struck through and dimmed.
- The difference does not rely on color alone, so the strike-through must be present.
- Using the action again on a Done Task returns it to Open.
- Completing a Task does not change its position in the List.

**Out of Scope:**
- Moving, hiding or auto-removing Done Tasks.

#### FR-3: Delete a Task

The user can Delete any Task, Open or Done, with one action on that Task. Realizes UJ-1.

**Consequences (testable):**
- The Task is removed from the List immediately.
- `[ASSUMPTION]` No confirmation dialog is shown and no undo is offered. Delete is final.
- The delete control is separate from the Complete action, so deleting cannot happen by accident when completing.

#### FR-4: Show the List and empty state

The Screen always shows every Task in the List. Realizes UJ-1.

**Consequences (testable):**
- All Tasks are visible on the one Screen, with the List scrolling if it is long.
- `[ASSUMPTION]` When the List has no Tasks, the Screen shows a short hint inviting the user to add one, instead of a blank area.

#### FR-5: Keep Tasks between visits

The List persists on the user's own device. Realizes UJ-1.

**Consequences (testable):**
- After a page reload or browser restart, every Task is present with its text, state and order unchanged.
- `[ASSUMPTION]` Storage is local to the browser. No Task data is sent to any server.
- `[ASSUMPTION]` If local storage is unavailable, the app still works for the current session and loses the List on reload, without showing an error.

**Notes:**
- `[NOTE FOR PM]` The brief left open whether Delete needs confirmation or undo. This PRD assumes neither, to keep Delete to one step. Revisit if accidental deletes prove annoying in real use.

## 5. Cross-Cutting NFRs

- **Responsive:** The Screen is usable from phone width (about 320 px) to desktop with no horizontal scrolling. `[ASSUMPTION]`
- **Accessible:** Every action works from the keyboard. Controls have text labels available to assistive technology. Text contrast meets WCAG 2.1 AA. `[ASSUMPTION]`
- **Fast:** Add, Complete and Delete show their result in under 100 ms on an ordinary device. `[ASSUMPTION]`
- **Private:** The product collects no personal data and makes no network calls with Task data.
- **Browsers:** Current versions of the major evergreen browsers. `[ASSUMPTION]`

## 6. Non-Goals (Explicit)

- umasha is not a project manager, planner or calendar.
- It will not become a multi-user or cloud product in v1.
- It will not grow settings, themes, onboarding or extra screens in v1.
- It does not try to out-feature existing todo apps.

## 7. MVP Scope

### 7.1 In Scope

- Add, Complete (and un-complete) and Delete Tasks
- One Screen showing the full List and an empty-state hint
- Local persistence in the browser
- Responsive layout for desktop and phone

### 7.2 Out of Scope for MVP

- Accounts, login, sync or sharing (no multi-user need)
- Editing a Task's text after it is added (deferred to a later version if real use demands it)
- Due dates, reminders, priorities, tags, categories
- Multiple lists, search, filters, sorting options, reordering
- Clear-all-completed action (candidate for later)
- Native mobile or desktop packaging

## 8. Success Metrics

`[ASSUMPTION]` Success is usability, not business results.

**Primary**
- **SM-1**: A first-time user can Add, Complete and Delete a Task with no instructions. Target: every person in an informal try-out of two or three people succeeds on the first attempt. Validates FR-1, FR-2, FR-3.
- **SM-2**: The List survives a reload. Target: 100 percent of Tasks present with correct state after reload. Validates FR-5.

**Secondary**
- **SM-3**: Each of the three actions takes one step after the text is entered. Target: Add is Enter or one click, Complete is one click, Delete is one click. Validates FR-1, FR-2, FR-3.
- **SM-4**: The whole product fits on one Screen with no navigation. Validates FR-4.

**Counter-metrics (do not optimize)**
- **SM-C1**: Number of features and controls on the Screen. Do not grow it to look more capable, because restraint is the product. Counterbalances SM-1 and SM-3.
- **SM-C2**: Time spent in the app. Do not optimize for engagement, because the best session is a few seconds long. Counterbalances SM-1.

## 9. Open Questions

1. Should Delete ask for confirmation or offer undo? Assumed neither for v1 (FR-3). Revisit after first real use.
2. Is a browser-based web app the right form, or is a native app wanted? Assumed web (section 5).
3. Should a Done Task eventually move to the bottom or be clearable in bulk? Assumed no for v1; candidate for a later version.

## 10. Assumptions Index

- Section 2.1: The builder also treats this as a small, finishable project.
- Section 2.3 (UJ-1): Persona name and scenario are illustrative.
- Section 4.1: Tasks are shown oldest first and Done Tasks keep their position.
- FR-1: Input limit of 200 characters, with longer text wrapping in the list.
- FR-3: Delete has no confirmation and no undo.
- FR-4: Empty List shows a short hint.
- FR-5: Storage is local to the browser, and a storage failure degrades silently to session-only use.
- Section 5: Responsive from about 320 px, keyboard and WCAG 2.1 AA accessibility, 100 ms response, evergreen browsers.
- Section 8: Success measured by usability with an informal try-out, not business metrics.
- Carried from the brief: web app form factor, single user, text-only Tasks, no editing in v1.
