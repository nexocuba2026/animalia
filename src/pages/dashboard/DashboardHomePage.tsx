import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { Link } from 'react-router-dom'

type Stats = {
  productos: number
  citasPendientes: number
  noticias: number
  mascotas: number
  pedidosPendientes: number
}

type Noticia = {
  id: string
  titulo: string
  contenido: string
  imagen_url: string
  created_at: string
}

export default function DashboardHomePage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<Stats>({
    productos: 0,
    citasPendientes: 0,
    noticias: 0,
    mascotas: 0,
    pedidosPendientes: 0,
  })
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    const fetchData = async () => {
      // Productos activos
      const { count: productos } = await supabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

      // Citas pendientes según rol
      let queryCitas = supabase.from('citas').select('*', { count: 'exact', head: true }).eq('estado', 'solicitada')
      if (profile.role === 'cliente') queryCitas = queryCitas.eq('cliente_id', profile.id)
      const { count: citasPendientes } = await queryCitas

      // Noticias publicadas
      const { count: noticias } = await supabase
        .from('noticias')
        .select('*', { count: 'exact', head: true })
        .eq('publicada', true)

      // Mascotas
      let queryMascotas = supabase.from('mascotas').select('*', { count: 'exact', head: true })
      if (profile.role === 'cliente') queryMascotas = queryMascotas.eq('propietario_id', profile.id)
      const { count: mascotas } = await queryMascotas

      // Pedidos pendientes (solo administradores)
      let pedidosPendientes = 0
      if (['recepcionista', 'veterinario', 'administrador', 'superadmin'].includes(profile.role)) {
        const { count } = await supabase
          .from('pedidos')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'enviado')
        pedidosPendientes = count || 0
      }

      setStats({
        productos: productos || 0,
        citasPendientes: citasPendientes || 0,
        noticias: noticias || 0,
        mascotas: mascotas || 0,
        pedidosPendientes,
      })

      // Noticias para el carrusel
      const { data: noticiasData } = await supabase
        .from('noticias')
        .select('*')
        .eq('publicada', true)
        .order('created_at', { ascending: false })
        .limit(5)
      if (noticiasData) setNoticias(noticiasData)

      setLoading(false)
    }

    fetchData()
  }, [profile])

  if (loading) return <div className="flex justify-center items-center h-64">Cargando estadísticas...</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Bienvenido, {profile?.nombre_completo || 'Usuario'}</h1>
        <p className="text-gray-500 mt-1">Resumen de actividad</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Link to="/dashboard/tienda" className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow hover:shadow-lg transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Productos en tienda</p>
              <p className="text-3xl font-bold text-orange-600">{stats.productos}</p>
            </div>
            <span className="text-3xl">🛍️</span>
          </div>
        </Link>

        <Link to="/dashboard/citas" className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow hover:shadow-lg transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Citas pendientes</p>
              <p className="text-3xl font-bold text-orange-600">{stats.citasPendientes}</p>
            </div>
            <span className="text-3xl">📅</span>
          </div>
        </Link>

        <Link to="/dashboard/noticias" className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow hover:shadow-lg transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Noticias publicadas</p>
              <p className="text-3xl font-bold text-orange-600">{stats.noticias}</p>
            </div>
            <span className="text-3xl">📰</span>
          </div>
        </Link>

        <Link to="/dashboard/pacientes" className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow hover:shadow-lg transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Mascotas {profile?.role === 'cliente' ? 'propias' : 'registradas'}</p>
              <p className="text-3xl font-bold text-orange-600">{stats.mascotas}</p>
            </div>
            <span className="text-3xl">🐶</span>
          </div>
        </Link>

        {/* Solo para administradores */}
        {['recepcionista', 'veterinario', 'administrador', 'superadmin'].includes(profile?.role || '') && (
          <Link to="/dashboard/admin-pedidos" className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow hover:shadow-lg transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Pedidos recibidos</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pedidosPendientes}</p>
              </div>
              <span className="text-3xl">📦</span>
            </div>
          </Link>
        )}
      </div>

      {/* Carrusel de noticias */}
      {noticias.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">📰 Últimas noticias</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {noticias.map((n) => (
              <div key={n.id} className="snap-start shrink-0 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow border p-4">
                {n.imagen_url && <img src={n.imagen_url} alt={n.titulo} className="h-40 w-full object-cover rounded-xl mb-3" />}
                <h3 className="font-bold text-lg">{n.titulo}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">{n.contenido}</p>
                <span className="text-xs text-gray-500 mt-2">{new Date(n.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}