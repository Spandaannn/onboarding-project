import { useState } from 'react'
import TaskForm from './components/TaskForm'
import FilterBar from './components/FilterBar'
import TaskItem from './components/TaskItem'

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 }

export default function App() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('All')
  const [sortByPriority, setSortByPriority] = useState(false)

  function addTask(data) {
    // crypto.randomUUID() gives a unique id without a backend
    setTasks([{ id: crypto.randomUUID(), completed: false, ...data }, ...tasks])
  }

  function updateTask(updated) {
    setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)))
  }

  function deleteTask(id) {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  let visible = tasks.filter((t) =>
    filter === 'Active' ? !t.completed : filter === 'Completed' ? t.completed : true
  )
  if (sortByPriority) {
    visible = [...visible].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">Task Manager</h1>
        <TaskForm onAdd={addTask} />
        <FilterBar
          filter={filter}
          onFilter={setFilter}
          sortByPriority={sortByPriority}
          onToggleSort={() => setSortByPriority(!sortByPriority)}
        />
        {visible.length === 0 ? (
          <p className="text-center text-slate-500 py-10">
            {tasks.length === 0 ? 'No tasks yet — add your first one above! 🎉' : `No ${filter.toLowerCase()} tasks.`}
          </p>
        ) : (
          <ul className="space-y-3">
            {visible.map((t) => (
              <TaskItem key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}