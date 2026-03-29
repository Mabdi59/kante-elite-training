import { useEffect, useState } from 'react'
import { getAdminTestimonials, deleteTestimonial } from '../../services/api'
import type { Testimonial } from '../../types'

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminTestimonials()
      .then(setTestimonials)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this testimonial?')) return
    try {
      await deleteTestimonial(id)
      setTestimonials((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="text-gray-400">Loading testimonials…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-white text-3xl font-black">Testimonials</h1>
        <p className="text-gray-400 text-sm">
          POST /api/admin/testimonials to add
        </p>
      </div>

      {testimonials.length === 0 ? (
        <p className="text-gray-400">No testimonials yet.</p>
      ) : (
        <div className="grid gap-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white font-bold">{t.name}</h3>
                  <span className="text-yellow-400 text-xs">{'★'.repeat(t.rating)}</span>
                  {t.featured && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{t.roleOrContext}</p>
                <p className="text-gray-500 text-sm mt-1 italic">"{t.quote}"</p>
              </div>
              <button
                onClick={() => handleDelete(t.id)}
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
