import { useEffect, useState } from 'react'
import { getAdminPrograms, deleteProgram } from '../../services/api'
import type { Program } from '../../types'

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminPrograms()
      .then(setPrograms)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this program?')) return
    try {
      await deleteProgram(id)
      setPrograms((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="text-gray-400">Loading programs…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-white text-3xl font-black">Programs</h1>
        <p className="text-gray-400 text-sm">
          Use the API to create programs (POST /api/admin/programs)
        </p>
      </div>

      {programs.length === 0 ? (
        <p className="text-gray-400">No programs yet.</p>
      ) : (
        <div className="grid gap-4">
          {programs.map((p) => (
            <div
              key={p.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{p.icon}</span>
                  <h3 className="text-white font-bold">{p.name}</h3>
                  <span className="text-green-400 text-sm font-semibold">
                    ${p.price}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{p.shortDescription}</p>
                <p className="text-gray-600 text-xs mt-1">/{p.slug}</p>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-red-500 hover:text-red-400 text-sm ml-4"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
