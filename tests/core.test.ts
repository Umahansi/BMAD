import { describe, expect, it } from 'vitest'
import { add, MAX_TASK_LENGTH, reduce, type Task } from '../src/core/index.ts'

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

describe('add/reduce', () => {
  it('appends a new task in order, without mutating the old array', () => {
    const initial: Task[] = [{ id: 'existing', text: 'Existing task', done: false }]

    const next = reduce(initial, add('Buy rice'))

    expect(next).not.toBe(initial)
    expect(initial).toHaveLength(1)
    expect(next).toHaveLength(2)
    expect(next[0]).toEqual(initial[0])
    expect(next[1]).toMatchObject({ text: 'Buy rice', done: false })
  })

  it('gives each new task a unique id from createTaskId', () => {
    const afterFirst = reduce([], add('First'))
    const afterSecond = reduce(afterFirst, add('Second'))

    const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    expect(afterFirst[0].id).toMatch(uuidV4Pattern)
    expect(afterSecond[1].id).not.toBe(afterFirst[0].id)
  })

  it('trims leading and trailing whitespace from the saved text', () => {
    const next = reduce([], add('  Call the bank  '))

    expect(next[0].text).toBe('Call the bank')
  })

  it('does not add a task for empty text, returning the same state reference', () => {
    const initial: Task[] = []

    const next = reduce(initial, add(''))

    expect(next).toBe(initial)
  })

  it('does not add a task for whitespace-only text, returning the same state reference', () => {
    const initial: Task[] = []

    const next = reduce(initial, add('   '))

    expect(next).toBe(initial)
  })

  it('does not add a task when trimmed text exceeds MAX_TASK_LENGTH', () => {
    const initial: Task[] = []
    const tooLong = 'a'.repeat(MAX_TASK_LENGTH + 1)

    const next = reduce(initial, add(tooLong))

    expect(next).toBe(initial)
  })

  it('adds a task when trimmed text is exactly MAX_TASK_LENGTH characters', () => {
    const exactLength = 'a'.repeat(MAX_TASK_LENGTH)

    const next = reduce([], add(exactLength))

    expect(next).toHaveLength(1)
    expect(next[0].text).toBe(exactLength)
  })

  it('adds a task when text is over MAX_TASK_LENGTH before trimming but exactly MAX_TASK_LENGTH after trimming', () => {
    const padded = `  ${'a'.repeat(MAX_TASK_LENGTH)}  `

    const next = reduce([], add(padded))

    expect(next).toHaveLength(1)
    expect(next[0].text).toHaveLength(MAX_TASK_LENGTH)
  })
})
