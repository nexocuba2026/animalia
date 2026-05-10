import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'

type Noticia = {
  id: string
  titulo: string
  contenido: string
  imagen_url: string
  publicada: boolean
  created_at: string
}

export default function NoticiasPage() {
  const { profile } = useAuth()
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [editando, setEditando] = useState<Noticia | null>(null)
  const [mensaje, setMensaje] = useState('')
  const esAdmin = profile?.role === 'administrador' || profile?.role === 'superadmin'

  useEffect(() => {
    if (!profile) return
    let query = supabase.from('noticias').select('*').order('created_at', { ascending: false })
    if (!esAdmin) query = query.eq('publicada', true)
    query.then(({ data }) => {
      if (data) setNoticias(data)
    })
  }, [profile, esAdmin])

  const guardarNoticia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editando) return
    setMensaje('')

    const datos = {
      titulo: editando.titulo,
      contenido: editando.contenido,
      imagen_url: editando.imagen_url || null,
      publicada: editando.publicada,
    }

    const { error } = editando.id
      ? await supabase.from('noticias').update(datos).eq('id', editando.id)
      : await supabase.from('noticias').insert(datos)

    if (error) setMensaje('Error: ' + error.message)
    else {
      setMensaje('Noticia guardada.')
      setEditando(null)
      const { data } = await supabase.from('noticias').select('*').order('created_at', { ascending: false })
      if (data) setNoticias(data)
    }
  }

  const eliminarNoticia = async (id: string) => {
    if (!confirm('¿Eliminar esta noticia?')) return
    await supabase.from('noticias').delete().eq('id', id)
    setNoticias((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📰 Noticias</h1>
        {esAdmin && (
          <button
            onClick={() => setEditando({ id: '', titulo: '', contenido: '', imagen_url: '', publicada: false, created_at: '' })}
            className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600"
          >
            + Nueva Noticia
          </button>
        )}
      </div>

      {mensaje && <div className="bg-green-100 text-green-800 p-3 rounded-xl">{mensaje}</div>}

      <div className="grid gap-4">
        {noticias.map((n) => (
          <div key={n.id} className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{n.titulo}</h3>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{n.contenido}</p>
                {n.imagen_url && (
                  <img src={n.imagen_url} alt={n.titulo} className="mt-3 max-w-full h-auto max-h-60 rounded-lg object-cover" />
                )}
                <div className="flex gap-2 mt-2 text-xs text-gray-500">
                  <span>{new Date(n.created_at).toLocaleDateString()}</span>
                  {esAdmin && <span>· {n.publicada ? '✅ Publicada' : '📝 Borrador'}</span>}
                </div>
              </div>
              {esAdmin && (
                <div className="flex gap-2 ml-4">
                  <button onClick={() => setEditando(n)} className="text-orange-600 hover:underline text-sm">Editar</button>
                  <button onClick={() => eliminarNoticia(n.id)} className="text-red-600 hover:underline text-sm">Eliminar</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {noticias.length === 0 && <p className="text-gray-500">No hay noticias disponibles.</p>}
      </div>

      {/* Modal edición */}
      {editando && esAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={guardarNoticia} className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-bold">{editando.id ? 'Editar' : 'Nueva'} Noticia</h2>
            <input type="text" placeholder="Título" value={editando.titulo} onChange={(e) => setEditando({...editando, titulo: e.target.value})} className="w-full border rounded-xl px-4 py-2" required />
            <textarea placeholder="Contenido" value={editando.contenido} onChange={(e) => setEditando({...editando, contenido: e.target.value})} className="w-full border rounded-xl px-4 py-2" rows={5} />
            <input type="text" placeholder="URL imagen (opcional)" value={editando.imagen_url} onChange={(e) => setEditando({...editando, imagen_url: e.target.value})} className="w-full border rounded-xl px-4 py-2" />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={editando.publicada} onChange={(e) => setEditando({...editando, publicada: e.target.checked})} />
              Publicar ahora
            </label>
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