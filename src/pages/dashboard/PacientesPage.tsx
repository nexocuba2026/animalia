import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { Link } from 'react-router-dom'

type Mascota = {
  id: string
  nombre: string
  especie: string
  raza: string
  peso: number
  fecha_nacimiento: string
  estado: string
  numero_historia_clinica: string
  propietario_id: string
}

export default function PacientesPage() {
  const { profile } = useAuth()
  const [mascotas, setMascotas] = useState<Mascota[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    let query = supabase.from('mascotas').select('*')
    if (profile.role === 'cliente') {
      query = query.eq('propietario_id', profile.id)
    }
    query.then(({ data }) => {
      if (data) setMascotas(data)
      setLoading(false)
    })
  }, [profile])

  if (loading) return <div className="p-4">Cargando pacientes...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🐾 Pacientes</h1>
        {profile?.role !== 'cliente' && (
          <Link to="/dashboard/pacientes/nuevo" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl transition">
            + Nuevo Paciente
          </Link>
        )}
      </div>

      {mascotas.length === 0 ? (
        <p className="text-gray-500">No se encontraron pacientes.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mascotas.map((m) => (
            <div key={m.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold">{m.nombre}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${m.estado === 'activa' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {m.estado.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600">{m.especie} {m.raza && `· ${m.raza}`}</p>
              {m.peso && <p className="text-sm text-gray-500">{m.peso} kg</p>}
              {m.numero_historia_clinica && (
                <p className="text-xs text-gray-400 mt-1">HC: {m.numero_historia_clinica}</p>
              )}
              <div className="mt-3">
                <Link to={`/dashboard/historial/${m.id}`} className="text-orange-600 hover:underline text-sm font-medium">
                  Ver historial
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}