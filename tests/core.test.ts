import { describe, expect, it } from 'vitest'
import { MAX_TASK_LENGTH, type Task } from '../src/core/index.ts'

describe('core', () => {
  it('exposes MAX_TASK_LENGTH as 200', () => {
    expect(MAX_TASK_LENGTH).toBe(200)
  })

  it('accepts a literal satisfying the Task shape and reads it back', () => {
    const task: Task = { id: '1', text: 'Buy milk', done: false }

    expect(task.id).toBe('1')
    expect(task.text).toBe('Buy milk')
    expect(task.done).toBe(false)
  })
})
