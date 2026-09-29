// All HTTP calls live here, so components never deal with fetch details.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    // fetch only throws when the server can't be reached at all (down, wrong URL, CORS blocked)
    throw new Error(`Cannot reach the server at ${API_URL}. Is the backend running?`)
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const fieldErrors = data?.errors?.map((e) => `${e.field}: ${e.message}`).join(', ')
    throw new Error(fieldErrors || data?.detail || `Request failed (${res.status})`)
  }
  return { data, headers: res.headers }
}

export const api = {
  list: ({ search = '', skip = 0, limit = 10 } = {}) =>
    request(`/tasks?${new URLSearchParams({ search, skip, limit })}`),
  create: (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  update: (task) =>
    request(`/tasks/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        priority: task.priority,
        completed: task.completed,
      }),
    }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  breakdown: (id) => request(`/tasks/${id}/breakdown`, { method: 'POST' }),
  saveSubtasks: (id, subtasks) =>
    request(`/tasks/${id}/subtasks`, { method: 'POST', body: JSON.stringify({ subtasks }) }),
}
