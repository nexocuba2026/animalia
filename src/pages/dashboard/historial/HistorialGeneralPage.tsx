import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth-context'
import { Link } from 'react-router-dom'

type EntradaHistorial = {
  id: string
  fecha: string
  tipo: string
  descripcion: string
  mascota_id: string
  veterinario_id: string
  mascota: {
    id: string
    nombre: string
    especie: string
    numero_historia_clinica: string
  } | null
  veterinario: {
    nombre_completo: string
  } | null
}

export default function HistorialGeneralPage() {
  const { profile } = useAuth()
  const [entradas, setEntradas] = useState<EntradaHistorial[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todas')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  useEffect(() => {
    if (!profile || !['veterinario', 'tecnico', 'administrador', 'superadmin'].includes(profile.role)) return
    fetchEntradas()
  }, [profile])

  const fetchEntradas = async () => {
    const { data } = await supabase
      .from('historias_clinicas')
      .select(`
        id, fecha, tipo, descripcion, mascota_id, veterinario_id,
        mascota:mascotas ( id, nombre, especie, numero_historia_clinica ),
        veterinario:profiles!veterinario_id ( nombre_completo )
      `)
      .order('fecha', { ascending: false })

    if (data) setEntradas(data as unknown as EntradaHistorial[])
    setLoading(false)
  }

  const entradasFiltradas = entradas.filter((e) => {
    const coincideTipo = filtroTipo === 'todas' || e.tipo === filtroTipo
    const coincideBusqueda =
      busqueda === '' ||
      e.mascota?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.mascota?.numero_historia_clinica?.toLowerCase().includes(busqueda.toLowerCase())
    const desdeOk = !fechaDesde || new Date(e.fecha) >= new Date(fechaDesde)
    const hastaOk = !fechaHasta || new Date(e.fecha) <= new Date(fechaHasta + 'T23:59:59')
    return coincideTipo && coincideBusqueda && desdeOk && hastaOk
  })

  if (!profile || !['veterinario', 'tecnico', 'administrador', 'superadmin'].includes(profile.role))
    return <p className="p-4">Acceso denegado.</p>

  if (loading) return <p className="p-4">Cargando historial clínico...</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">📋 Historial Clínico General</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white border border-gray-200 rounded-2xl p-4">
        <input
          type="text"
          placeholder="🔍 Buscar mascota o HC"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border rounded-xl px-4 py-2 text-sm"
        />
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="border rounded-xl px-4 py-2 text-sm"
        >
          <option value="todas">Todos los tipos</option>
          <option value="consulta">Consulta</option>
          <option value="vacuna">Vacuna</option>
          <option value="tratamiento">Tratamiento</option>
          <option value="analisis">Análisis</option>
          <option value="nota">Nota</option>
        </select>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Desde</label>
          <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="border rounded-xl px-4 py-2 text-sm" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Hasta</label>
          <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="border rounded-xl px-4 py-2 text-sm" />
        </div>
      </div>

      {/* Listado */}
      {entradasFiltradas.length === 0 ? (
        <p className="text-gray-500">No se encontraron entradas.</p>
      ) : (
        <div className="space-y-4">
          {entradasFiltradas.map((entrada) => (
            <div key={entrada.id} className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="capitalize font-semibold text-sm bg-gray-200 px-2 py-0.5 rounded">
                      {entrada.tipo}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(entrada.fecha).toLocaleDateString()}
                    </span>
                    {entrada.veterinario && (
                      <span className="text-xs text-gray-400">
                        Dr/a. {entrada.veterinario.nombre_completo}
                      </span>
                    )}
                  </div>
                  {entrada.mascota && (
                    <div className="text-sm">
                      <span className="font-medium">{entrada.mascota.nombre}</span> ({entrada.mascota.especie}) — HC: {entrada.mascota.numero_historia_clinica}
                    </div>
                  )}
                  <p className="mt-2 text-gray-800 text-sm">{entrada.descripcion}</p>
                </div>
                <Link
                  to={`/dashboard/historial/${entrada.mascota_id}`}
                  className="text-orange-600 hover:underline text-xs font-medium whitespace-nowrap"
                >
                  Ver historial completo
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}