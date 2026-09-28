const FILTERS = ['All', 'Active', 'Completed']

export default function FilterBar({ filter, onFilter, sortByPriority, onToggleSort }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => onFilter(f)}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-white border'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={sortByPriority} onChange={onToggleSort} />
        Sort by priority
      </label>
    </div>
  )
}