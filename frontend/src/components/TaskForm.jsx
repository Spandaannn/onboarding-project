import { useState } from 'react'

const PRIORITIES = ['Low', 'Medium', 'High']

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault() // stop the browser from reloading the page
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    onAdd({ title: title.trim(), description: description.trim(), priority })
    setTitle('')
    setDescription('')
    setPriority('Medium')
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 space-y-3">
      <input
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Task title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Description (optional)"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          className="border rounded-lg px-3 py-2 sm:w-40"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          {PRIORITIES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <button className="flex-1 bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-indigo-700">
          Add task
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  )
}