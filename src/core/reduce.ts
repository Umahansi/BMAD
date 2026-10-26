import { createTaskId } from './id.ts'
import { MAX_TASK_LENGTH, type Task } from './task.ts'

export type Action = { type: 'add'; text: string }

export function add(text: string): Action {
  return { type: 'add', text }
}

export function reduce(state: Task[], action: Action): Task[] {
  switch (action.type) {
    case 'add': {
      const trimmed = action.text.trim()
      if (trimmed.length === 0 || trimmed.length > MAX_TASK_LENGTH) {
        return state
      }

      const newTask: Task = { id: createTaskId(), text: trimmed, done: false }
      return [...state, newTask]
    }
    default:
      return state
  }
}
