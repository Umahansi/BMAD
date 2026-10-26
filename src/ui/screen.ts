import type { Task } from '../core/index.ts'
import { MAX_TASK_LENGTH } from '../core/index.ts'

const EMPTY_HINT = 'No tasks yet. Add one above.'

export function render(
  container: HTMLElement,
  tasks: Task[],
  onAdd: (text: string) => boolean,
  onToggle: (id: string) => void,
  focusInput = false,
): void {
  container.textContent = ''

  const form = document.createElement('form')
  form.className = 'add-form'

  const label = document.createElement('label')
  label.className = 'add-label'
  label.htmlFor = 'new-task-input'
  label.textContent = 'New task'

  const input = document.createElement('input')
  input.type = 'text'
  input.id = 'new-task-input'
  input.name = 'task'
  input.maxLength = MAX_TASK_LENGTH
  input.autocomplete = 'off'

  const addButton = document.createElement('button')
  addButton.type = 'submit'
  addButton.textContent = 'Add'

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const added = onAdd(input.value)
    if (!added) {
      input.focus()
    }
  })

  form.append(label, input, addButton)
  container.append(form)

  if (tasks.length === 0) {
    const hint = document.createElement('p')
    hint.className = 'empty-hint'
    hint.textContent = EMPTY_HINT
    container.append(hint)
  }

  const list = document.createElement('ul')
  list.className = 'task-list'

  for (const task of tasks) {
    const item = document.createElement('li')
    item.className = 'task-item'
    if (task.done) {
      item.classList.add('done')
    }

    const label = document.createElement('label')
    label.className = 'task-label'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = task.done
    checkbox.addEventListener('change', () => onToggle(task.id))

    const text = document.createElement('span')
    text.className = 'task-text'
    text.textContent = task.text

    label.append(checkbox, text)
    item.append(label)
    list.append(item)
  }

  container.append(list)

  if (focusInput) {
    input.focus()
  }
}
