import './styles.css'
import type { Task } from './core/index.ts'
import { render } from './ui/screen.ts'

const root = document.querySelector<HTMLDivElement>('#app')!

let state: Task[] = []

function setState(next: Task[]): void {
  state = next
  render(root, state)
}

setState(state)
