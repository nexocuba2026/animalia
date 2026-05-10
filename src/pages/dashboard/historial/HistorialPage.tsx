import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'

type Historia = {
  id: string
  fecha: string
  tipo: string
  descripcion: string
}

type Mascota = {
  id: string
  numero_historia_clinica: string
  nombre: string
  especie: string
  estado: string
}

export default function HistorialPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [mascota, setMascota] = useState<Mascota | null>(null)
  const [historias, setHistorias] = useState<Historia[]>([])
  const [loading, setLoading] = useState(true)
  const [nuevaDescripcion, setNuevaDescripcion] = useState('')
  const [nuevoTipo, setNuevoTipo] = useState('consulta')
  const [message, setMessage] = useState('')
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>('activa')

  useEffect(() => {
    if (!profile || !id) return

    supabase
      .from('mascotas')
      .select('id, numero_historia_clinica, nombre, especie, estado')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setMascota(data)
          setEstadoSeleccionado(data.estado ?? 'activa')
        }
      })

    supabase
      .from('historias_clinicas')
      .select('*')
      .eq('mascota_id', id)
      .order('fecha', { ascending: false })
      .then(({ data }) => {
        if (data) setHistorias(data)
        setLoading(false)
      })
  }, [id, profile])

  const handleGuardar = async () => {
    if (!mascota) return

    if (estadoSeleccionado !== mascota.estado) {
      await supabase.from('mascotas').update({ estado: estadoSeleccionado }).eq('id', mascota.id)
    }

    if (nuevaDescripcion.trim()) {
      await supabase.from('historias_clinicas').insert({
        mascota_id: id,
        veterinario_id: profile!.id,
        tipo: nuevoTipo,
        descripcion: nuevaDescripcion,
      })
    }

    navigate('/dashboard/pacientes')
  }

  if (loading) return <div className="p-4">Cargando historial...</div>
  if (!mascota) return <div className="p-4">Mascota no encontrada.</div>

  const puedeEditar = ['veterinario', 'superadmin', 'tecnico', 'administrador'].includes(profile?.role || '')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Historial de {mascota.nombre} ({mascota.especie})</h1>
        <p className="text-sm text-gray-500">Nº HC: {mascota.numero_historia_clinica}</p>
      </div>

      {puedeEditar && (
        <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl">
          <span className="text-sm font-medium">Estado:</span>
          <select value={estadoSeleccionado} onChange={(e) => setEstadoSeleccionado(e.target.value)} className="border p-2 rounded-lg bg-white dark:bg-gray-700 text-sm">
            <option value="activa">🟢 Activa</option>
            <option value="baja">🔴 Baja</option>
          </select>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${estadoSeleccionado === 'activa' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {estadoSeleccionado === 'activa' ? 'ACTIVA' : 'BAJA'}
          </span>
        </div>
      )}

      <div className="space-y-4">
        {historias.length === 0 && <p>No hay entradas en el historial.</p>}
        {historias.map((h) => (
          <div key={h.id} className="bg-white dark:bg-gray-900 p-4 rounded shadow">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>{new Date(h.fecha).toLocaleDateString()}</span>
              <span className="capitalize">{h.tipo}</span>
            </div>
            <p>{h.descripcion}</p>
          </div>
        ))}
      </div>

      {puedeEditar && (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl space-y-3">
          <h2 className="text-xl font-semibold">Agregar al historial</h2>
          <select value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)} className="border p-2 rounded w-full bg-white dark:bg-gray-700">
            <option value="consulta">Consulta</option>
            <option value="vacuna">Vacuna</option>
            <option value="tratamiento">Tratamiento</option>
            <option value="analisis">Análisis</option>
            <option value="nota">Nota</option>
          </select>
          <textarea
            value={nuevaDescripcion}
            onChange={(e) => setNuevaDescripcion(e.target.value)}
            placeholder="Descripción"
            rows={4}
            className="border p-2 rounded w-full bg-white dark:bg-gray-700"
          />
          <button onClick={handleGuardar} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Guardar entrada y estado
          </button>
        </div>
      )}
    </div>
  )
}