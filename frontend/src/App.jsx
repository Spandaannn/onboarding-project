import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import TaskForm from './components/TaskForm'
import FilterBar from './components/FilterBar'
import TaskItem from './components/TaskItem'

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 }
const PAGE_SIZE = 10

export default function App() {
  const [tasks, setTasks] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [sortByPriority, setSortByPriority] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data, headers } = await api.list({ search, skip: page * PAGE_SIZE, limit: PAGE_SIZE })
      setTasks(data)
      setTotal(Number(headers.get('X-Total-Count') ?? data.length))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false) // runs on success AND failure, so the spinner never gets stuck
    }
  }, [search, page])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Runs any API action, then reloads the list. Returns true/false so forms know if it worked.
  async function run(action) {
    setError('')
    try {
      await action()
      await loadTasks()
      return true
    } catch (e) {
      setError(e.message)
      return false
    }
  }

  const addTask = (data) => run(() => api.create(data))
  const updateTask = (task) => run(() => api.update(task))
  const deleteTask = (id) => run(() => api.remove(id))

  let visible = tasks.filter((t) =>
    filter === 'Active' ? !t.completed : filter === 'Completed' ? t.completed : true
  )
  if (sortByPriority) {
    visible = [...visible].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  }
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">Task Manager</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 flex justify-between gap-3">
            <span>{error}</span>
            <button onClick={loadTasks} className="underline shrink-0">Retry</button>
          </div>
        )}

        <TaskForm onAdd={addTask} />

        <input
          className="w-full border rounded-lg px-3 py-2 bg-white"
          placeholder="Search by title…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
        />

        <FilterBar
          filter={filter}
          onFilter={setFilter}
          sortByPriority={sortByPriority}
          onToggleSort={() => setSortByPriority(!sortByPriority)}
        />

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <p className="text-center text-slate-500 py-10">
            {total === 0 && !search ? 'No tasks yet — add your first one above! 🎉' : 'No matching tasks.'}
          </p>
        ) : (
          <ul className="space-y-3">
            {visible.map((t) => (
              <TaskItem key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />
            ))}
          </ul>
        )}

        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button disabled={page === 0} onClick={() => setPage(page - 1)} className="border rounded-lg px-3 py-1 bg-white disabled:opacity-40">
              Previous
            </button>
            <span className="text-sm">Page {page + 1} of {pageCount}</span>
            <button disabled={page + 1 >= pageCount} onClick={() => setPage(page + 1)} className="border rounded-lg px-3 py-1 bg-white disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  )
}