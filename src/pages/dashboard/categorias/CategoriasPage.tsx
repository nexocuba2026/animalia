import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'
import { Link } from 'react-router-dom'

type Categoria = {
  id: string
  nombre: string
}

export default function CategoriasPage() {
  const { profile } = useAuth()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [mensaje, setMensaje] = useState('')

  const puedeGestionar = profile?.role && ['superadmin','administrador','recepcionista'].includes(profile.role)

  useEffect(() => {
    if (!profile) return
    fetchCategorias()
  }, [profile])

  const fetchCategorias = async () => {
    const { data } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre')
    if (data) setCategorias(data)
  }

  const guardarCategoria = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editando) return
    setMensaje('')

    if (!editando.nombre.trim()) {
      setMensaje('El nombre es obligatorio')
      return
    }

    const { error } = editando.id
      ? await supabase.from('categorias').update({ nombre: editando.nombre.trim() }).eq('id', editando.id)
      : await supabase.from('categorias').insert({ nombre: editando.nombre.trim() })

    if (error) {
      setMensaje('Error: ' + error.message)
    } else {
      setMensaje('Categoría guardada.')
      setEditando(null)
      fetchCategorias()
    }
  }

  const eliminarCategoria = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    const { error } = await supabase.from('categorias').delete().eq('id', id)
    if (error) {
      setMensaje('Error al eliminar: ' + error.message)
    } else {
      setMensaje('Categoría eliminada.')
      fetchCategorias()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/inventario"
            className="text-sm text-gray-600 hover:text-orange-600 flex items-center gap-1"
          >
            ← Volver al Inventario
          </Link>
          <h1 className="text-2xl font-bold">📁 Categorías</h1>
        </div>

        {puedeGestionar && (
          <button
            onClick={() => setEditando({ id: '', nombre: '' })}
            className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600"
          >
            + Agregar Categoría
          </button>
        )}
      </div>

      {mensaje && (
        <div className={`p-3 rounded-xl ${mensaje.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {mensaje}
        </div>
      )}

      {/* Lista de categorías como tarjetas */}
      <div className="grid gap-4">
        {categorias.length === 0 ? (
          <p className="text-gray-500">No hay categorías registradas.</p>
        ) : (
          categorias.map(cat => (
            <div key={cat.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex justify-between items-center">
              <span className="font-semibold">{cat.nombre}</span>
              {puedeGestionar && (
                <div className="flex gap-2">
                  <button onClick={() => setEditando(cat)} className="text-orange-600 hover:underline text-sm">Editar</button>
                  <button onClick={() => eliminarCategoria(cat.id)} className="text-red-600 hover:underline text-sm">Eliminar</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal formulario para agregar/editar categoría */}
      {editando && puedeGestionar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={guardarCategoria} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">
              {editando.id ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>

            <input
              type="text"
              placeholder="Nombre de la categoría"
              value={editando.nombre}
              onChange={e => setEditando({ ...editando, nombre: e.target.value })}
              className="w-full border rounded-xl px-4 py-2"
              required
              autoFocus
            />

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="px-4 py-2 bg-gray-200 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-xl"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}