import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'

type EquipoMember = {
  id: string
  nombre_completo: string
  cargo: string
  email: string
  telefono: string
}

export default function EquipoPage() {
  const { profile } = useAuth()
  const [miembros, setMiembros] = useState<EquipoMember[]>([])
  const [editando, setEditando] = useState<EquipoMember | null>(null)
  const [mensaje, setMensaje] = useState('')

  const puedeEditar = profile?.role === 'superadmin' || profile?.role === 'administrador'

  useEffect(() => {
    if (!profile) return
    fetchMiembros()
  }, [profile])

  const fetchMiembros = async () => {
    const { data } = await supabase.from('equipo').select('*').order('nombre_completo')
    if (data) setMiembros(data)
  }

  const guardarMiembro = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editando) return
    setMensaje('')

    const datos = {
      nombre_completo: editando.nombre_completo,
      cargo: editando.cargo,
      email: editando.email,
      telefono: editando.telefono,
    }

    const { error } = editando.id
      ? await supabase.from('equipo').update(datos).eq('id', editando.id)
      : await supabase.from('equipo').insert(datos)

    if (error) setMensaje('Error: ' + error.message)
    else {
      setMensaje('Miembro guardado.')
      setEditando(null)
      fetchMiembros()
    }
  }

  const eliminarMiembro = async (id: string) => {
    if (!confirm('¿Eliminar miembro?')) return
    await supabase.from('equipo').delete().eq('id', id)
    fetchMiembros()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">👥 Equipo de Trabajo</h1>
        {puedeEditar && (
          <button onClick={() => setEditando({ id: '', nombre_completo: '', cargo: '', email: '', telefono: '' })}
            className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600">
            + Nuevo Miembro
          </button>
        )}
      </div>

      {mensaje && <div className="bg-green-100 text-green-800 p-3 rounded-xl">{mensaje}</div>}

      <div className="grid gap-4">
        {miembros.map(m => (
          <div key={m.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{m.nombre_completo}</p>
              <p className="text-sm text-gray-600">{m.cargo}</p>
              <p className="text-xs text-gray-500">{m.email} · {m.telefono}</p>
            </div>
            {puedeEditar && (
              <div className="flex gap-2">
                <button onClick={() => setEditando(m)} className="text-orange-600 hover:underline text-sm">Editar</button>
                <button onClick={() => eliminarMiembro(m.id)} className="text-red-600 hover:underline text-sm">Eliminar</button>
              </div>
            )}
          </div>
        ))}
        {miembros.length === 0 && <p className="text-gray-500">No hay miembros registrados.</p>}
      </div>

      {editando && puedeEditar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={guardarMiembro} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">{editando.id ? 'Editar' : 'Nuevo'} Miembro</h2>
            <input type="text" placeholder="Nombre completo" value={editando.nombre_completo} onChange={e => setEditando({...editando, nombre_completo: e.target.value})} className="w-full border rounded-xl px-4 py-2" required />
            <input type="text" placeholder="Cargo" value={editando.cargo} onChange={e => setEditando({...editando, cargo: e.target.value})} className="w-full border rounded-xl px-4 py-2" required />
            <input type="email" placeholder="Email" value={editando.email} onChange={e => setEditando({...editando, email: e.target.value})} className="w-full border rounded-xl px-4 py-2" />
            <input type="text" placeholder="Teléfono" value={editando.telefono} onChange={e => setEditando({...editando, telefono: e.target.value})} className="w-full border rounded-xl px-4 py-2" />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setEditando(null)} className="px-4 py-2 bg-gray-200 rounded-xl">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-xl">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}