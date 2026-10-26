import './styles.css'
import { add, reduce, toggle, type Task } from './core/index.ts'
import { render } from './ui/screen.ts'

const root = document.querySelector<HTMLDivElement>('#app')!

let state: Task[] = []

function setState(next: Task[], focusInput = false): void {
  state = next
  render(root, state, handleAddSubmit, handleToggle, focusInput)
}

function handleAddSubmit(rawText: string): boolean {
  const next = reduce(state, add(rawText))
  const grew = next.length > state.length
  if (grew) {
    setState(next, true)
  }
  return grew
}

function handleToggle(id: string): void {
  setState(reduce(state, toggle(id)))
}

setState(state)
