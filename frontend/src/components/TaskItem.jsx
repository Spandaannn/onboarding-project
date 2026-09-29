import { useState } from 'react'
import { api } from '../api'

const BADGE = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-green-100 text-green-700',
}

export default function TaskItem({ task, onUpdate, onDelete, onSaveSubtasks }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task)
  const [suggestions, setSuggestions] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  async function getBreakdown() {
    setAiLoading(true)
    setAiError('')
    try {
      const { data } = await api.breakdown(task.id)
      setSuggestions(data.subtasks)
    } catch (e) {
      setAiError(e.message)
    } finally {
      setAiLoading(false)
    }
  }

  async function saveSuggestions() {
    const ok = await onSaveSubtasks(task.id, suggestions)
    if (ok) setSuggestions([])
  }

  function save() {
    if (!draft.title.trim()) return
    onUpdate({ ...draft, title: draft.title.trim() })
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="bg-white rounded-xl shadow p-4 space-y-2">
        <input
          className="w-full border rounded-lg px-3 py-2"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <textarea
          className="w-full border rounded-lg px-3 py-2"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
        <select
          className="border rounded-lg px-3 py-2"
          value={draft.priority}
          onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <div className="flex gap-2">
          <button onClick={save} className="bg-indigo-600 text-white rounded-lg px-3 py-1">Save</button>
          <button onClick={() => { setDraft(task); setEditing(false) }} className="border rounded-lg px-3 py-1">
            Cancel
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="bg-white rounded-xl shadow p-4 space-y-3">
      <div className="flex gap-3 items-start">
        <input
          type="checkbox"
          className="mt-1.5 h-4 w-4"
          checked={task.completed}
          onChange={() => onUpdate({ ...task, completed: !task.completed })}
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`font-semibold break-words ${task.completed ? 'line-through text-gray-400' : ''}`}>
              {task.title}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${BADGE[task.priority]}`}>{task.priority}</span>
          </div>
          {task.description && <p className="text-sm text-gray-600 mt-1 break-words">{task.description}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => { setDraft(task); setEditing(true) }} className="text-sm text-indigo-600">Edit</button>
          <button onClick={() => onDelete(task.id)} className="text-sm text-red-600">Delete</button>
        </div>
      </div>

      {task.subtasks?.length > 0 && (
        <ul className="ml-7 list-disc pl-4 text-sm text-gray-700 space-y-1">
          {task.subtasks.map((s) => <li key={s.id}>{s.title}</li>)}
        </ul>
      )}

      <div className="ml-7">
        <button
          onClick={getBreakdown}
          disabled={aiLoading}
          className="text-sm bg-violet-100 text-violet-700 rounded-lg px-3 py-1 disabled:opacity-50"
        >
          {aiLoading ? 'Thinking…' : '✨ AI Breakdown'}
        </button>
        {aiError && <p className="text-sm text-red-600 mt-2">{aiError}</p>}
        {suggestions.length > 0 && (
          <div className="mt-2 border border-violet-200 bg-violet-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-violet-700 mb-1">Suggested subtasks</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
            <div className="flex gap-2 mt-2">
              <button onClick={saveSuggestions} className="text-sm bg-violet-600 text-white rounded-lg px-3 py-1">Save</button>
              <button onClick={() => setSuggestions([])} className="text-sm border rounded-lg px-3 py-1 bg-white">Discard</button>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}
