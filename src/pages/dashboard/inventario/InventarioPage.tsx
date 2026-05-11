import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'
import { Link } from 'react-router-dom'

type InventarioItem = {
  id: string
  numero_inventario: string
  nombre: string
  categoria: string
  cantidad: number
  unidad: string
  precio_unitario: number
}

export default function InventarioPage() {
  const { profile } = useAuth()
  const [items, setItems] = useState<InventarioItem[]>([])
  const [editando, setEditando] = useState<InventarioItem | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([])

  const puedeEditar = profile?.role === 'superadmin' || profile?.role === 'recepcionista'

  useEffect(() => {
    if (!profile) return
    fetchItems()
    fetchCategorias()
  }, [profile])

  const fetchItems = async () => {
    const { data } = await supabase.from('inventario').select('*').order('numero_inventario')
    if (data) setItems(data)
  }

  const fetchCategorias = async () => {
    const { data } = await supabase.from('categorias').select('*').order('nombre')
    if (data) setCategorias(data)
  }

  const guardarItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editando) return
    setMensaje('')

    const datos = {
      nombre: editando.nombre,
      categoria: editando.categoria,
      cantidad: editando.cantidad,
      unidad: editando.unidad,
      precio_unitario: editando.precio_unitario,
    }

    const { error } = editando.id
      ? await supabase.from('inventario').update(datos).eq('id', editando.id)
      : await supabase.from('inventario').insert(datos)

    if (error) setMensaje('Error: ' + error.message)
    else {
      setMensaje('Item guardado.')
      setEditando(null)
      fetchItems()
    }
  }

  const eliminarItem = async (id: string) => {
    if (!confirm('¿Eliminar item?')) return
    await supabase.from('inventario').delete().eq('id', id)
    fetchItems()
  }

  if (!puedeEditar && profile) return <p className="p-4">Acceso denegado.</p>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📦 Inventario</h1>
        <div className="flex gap-2">
          <Link
            to="/dashboard/categorias"
            className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 text-sm font-medium"
          >
            📁 Categorías
          </Link>
          {puedeEditar && (
            <button
              onClick={() =>
                setEditando({
                  id: '',
                  numero_inventario: '',
                  nombre: '',
                  categoria: '',
                  cantidad: 0,
                  unidad: '',
                  precio_unitario: 0,
                })
              }
              className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600"
            >
              + Nuevo Item
            </button>
          )}
        </div>
      </div>

      {mensaje && <div className="bg-green-100 text-green-800 p-3 rounded-xl">{mensaje}</div>}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Nº Inventario</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Categoría</th>
              <th className="p-3 text-right">Cantidad</th>
              <th className="p-3 text-left">Unidad</th>
              <th className="p-3 text-right">Precio Unit.</th>
              {puedeEditar && <th className="p-3 text-center">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{item.numero_inventario}</td>
                <td className="p-3">{item.nombre}</td>
                <td className="p-3">{item.categoria}</td>
                <td className="p-3 text-right">{item.cantidad}</td>
                <td className="p-3">{item.unidad}</td>
                <td className="p-3 text-right">
                  ${item.precio_unitario?.toFixed(2) || '0.00'}
                </td>
                {puedeEditar && (
                  <td className="p-3 text-center">
                    <button onClick={() => setEditando(item)} className="text-orange-600 hover:underline mr-2">
                      Editar
                    </button>
                    <button onClick={() => eliminarItem(item.id)} className="text-red-600 hover:underline">
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={guardarItem} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">{editando.id ? 'Editar' : 'Nuevo'} Item</h2>

            <input
              type="text"
              placeholder="Nombre"
              value={editando.nombre}
              onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
              className="w-full border rounded-xl px-4 py-2"
              required
            />

            {/* Campo Categoría como desplegable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={editando.categoria}
                onChange={(e) => setEditando({ ...editando, categoria: e.target.value })}
                className="w-full border rounded-xl px-4 py-2"
                required
              >
                <option value="">-- Seleccionar categoría --</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
                {/* Opción para escribir una nueva categoría libre (por si acaso) */}
                <option value="__otra__">Otra (escribir manualmente)</option>
              </select>
              {editando.categoria === '__otra__' && (
                <input
                  type="text"
                  placeholder="Nueva categoría"
                  value=""
                  onChange={(e) => setEditando({ ...editando, categoria: e.target.value })}
                  className="w-full border rounded-xl px-4 py-2 mt-2"
                />
              )}
            </div>

            <input
              type="number"
              placeholder="Cantidad"
              value={editando.cantidad}
              onChange={(e) => setEditando({ ...editando, cantidad: parseInt(e.target.value) || 0 })}
              className="w-full border rounded-xl px-4 py-2"
            />

            <input
              type="text"
              placeholder="Unidad"
              value={editando.unidad}
              onChange={(e) => setEditando({ ...editando, unidad: e.target.value })}
              className="w-full border rounded-xl px-4 py-2"
            />

            <input
              type="number"
              step="0.01"
              placeholder="Precio unitario"
              value={editando.precio_unitario}
              onChange={(e) => setEditando({ ...editando, precio_unitario: parseFloat(e.target.value) || 0 })}
              className="w-full border rounded-xl px-4 py-2"
            />

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="px-4 py-2 bg-gray-200 rounded-xl"
              >
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-xl">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}