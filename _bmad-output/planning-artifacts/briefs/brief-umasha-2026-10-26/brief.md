---
title: "Product Brief: umasha"
status: final
created: 2026-10-26
updated: 2026-10-26
stepsCompleted: [discovery, draft, finalize]
---

# Product Brief: umasha

Items tagged `[ASSUMPTION]` were inferred, not confirmed. Correct any that are wrong.

## Executive Summary

umasha is a single-screen todo app. A person types a task, adds it to a list, marks it done, and deletes it when it is no longer needed. Nothing else.

The goal is a tool that is faster to use than a sticky note and has nothing to learn. There are no accounts, no settings and no extra screens. The whole product fits in one view.

`[ASSUMPTION]` This is a personal, low-stakes project, so the brief stays light and carries no business targets.

## The Problem

People keep small to-dos in their head, on paper, or in heavy apps built for project management. The head forgets, paper gets lost, and heavy apps add friction that makes quick capture feel like work.

The cost is small but constant: forgotten tasks, and tools abandoned because they ask for more effort than the task is worth.

## The Solution

One screen with three actions:

- Add a task by typing text and confirming.
- Complete a task with a single tap or click on it. Done tasks look visibly different.
- Delete a task with a single action.

`[ASSUMPTION]` Completed tasks stay in the list, shown struck through, and can be un-completed with the same action.

`[ASSUMPTION]` Tasks persist across reloads and restarts, stored on the user's own device with no server.

## What Makes This Different

Honestly, nothing technical. Many todo apps exist. The only edge is restraint: the product does three things and stays out of the way. If that restraint is lost, so is the reason to build it.

## Who This Serves

`[ASSUMPTION]` One primary user: an individual who wants a quick personal checklist for the day or week. They use it on their own, on one device, and do not need to share lists or sync across devices.

Success for them is opening it, seeing what is left, and updating it in seconds.

## Success Criteria

`[ASSUMPTION]` Measured by usability, not business metrics:

- A new user can add, complete and delete a task without instructions.
- Each of the three actions takes one step after the task text is entered.
- The task list is still there after a page reload.
- The whole product fits on one screen with no navigation.

## Scope

**In for v1**

- Add, complete (and un-complete) and delete tasks
- A single screen showing the full list
- Local persistence

**Out for v1** `[ASSUMPTION]`

- Accounts, login, sync or sharing
- Editing task text after it is added
- Due dates, reminders, priorities, tags or categories
- Multiple lists, search, filters or sorting options
- Native mobile or desktop packaging

`[ASSUMPTION]` The form factor is a web app that runs in a browser and works on both desktop and phone screen sizes.

## Open Questions

- Should deleting ask for confirmation, or be instant with an undo?
- Should an empty list show a hint or a blank screen?
- Is a web app the right form, or is a native app wanted?

## Vision

If it works, umasha stays small. Possible later steps, only if real use demands them: editing a task, clearing all completed tasks in one action, and optional sync across devices. Each addition must pass the same test: does it keep the screen simple?
