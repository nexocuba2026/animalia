import { useEffect, useState } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'

export default function DashboardLayout() {
  const { user, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) return <div className="flex justify-center items-center min-h-screen">Cargando...</div>
  if (!user || !profile) return null

  const menuItems: { label: string; path: string; roles: string[] }[] = [
    { label: 'Inicio', path: '/dashboard', roles: ['cliente', 'recepcionista', 'veterinario', 'tecnico', 'administrador', 'superadmin'] },
    { label: 'Pacientes', path: '/dashboard/pacientes', roles: ['cliente', 'recepcionista', 'veterinario', 'tecnico', 'administrador', 'superadmin'] },
    { label: 'Solicitar Cita', path: '/dashboard/citas/solicitar', roles: ['cliente'] },
    { label: 'Mis Citas', path: '/dashboard/citas', roles: ['cliente', 'recepcionista', 'veterinario', 'tecnico', 'administrador', 'superadmin'] },
    { label: 'Tienda', path: '/dashboard/tienda', roles: ['cliente'] },
    { label: 'Mis Pedidos', path: '/dashboard/pedidos', roles: ['cliente'] },
    { label: 'Agenda Diaria', path: '/dashboard/agenda', roles: ['veterinario', 'recepcionista', 'administrador', 'superadmin'] },
    { label: 'Historial Clínico', path: '/dashboard/historial', roles: ['veterinario', 'tecnico', 'administrador', 'superadmin'] },
    { label: 'Gestión Contenido', path: '/dashboard/contenido', roles: ['administrador', 'superadmin'] },
    { label: 'Gestión Tienda', path: '/dashboard/admin-tienda', roles: ['administrador', 'superadmin'] },
    { label: 'Pedidos Recibidos', path: '/dashboard/admin-pedidos', roles: ['recepcionista', 'veterinario', 'administrador', 'superadmin'] },
    { label: 'Noticias', path: '/dashboard/noticias', roles: ['administrador', 'superadmin'] },
    { label: 'Registro de Ventas', path: '/dashboard/ventas', roles: ['administrador', 'superadmin'] },
    { label: 'Usuarios', path: '/dashboard/usuarios', roles: ['superadmin'] },
    { label: 'Herramientas', path: '/dashboard/herramientas', roles: ['superadmin'] },
    { label: 'Inventario', path: '/dashboard/inventario', roles: ['superadmin', 'recepcionista'] },
    { label: 'Equipo', path: '/dashboard/equipo', roles: ['superadmin', 'administrador'] },
    { label: 'Registro de Consulta', path: '/dashboard/consulta', roles: ['veterinario', 'superadmin', 'administrador'] },
    { label: 'Registro de Tratamiento', path: '/dashboard/tratamiento', roles: ['tecnico', 'superadmin', 'administrador'] },
  ]

  const filteredMenu = menuItems.filter(item => item.roles.includes(profile.role))

  const handleLinkClick = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-white">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10">
            <img src="/logo.png" alt="ANIMALIA" className="w-10 h-10 rounded-lg object-contain" />
            <div>
              <h1 className="text-xl font-bold text-orange-600 leading-tight">ANIMALIA</h1>
              <p className="text-xs text-gray-500">Centro Veterinario Universitario</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {filteredMenu.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm uppercase">
                {(profile.nombre_completo?.[0] || 'U')}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{profile.nombre_completo || 'Usuario'}</p>
                <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
              </div>
            </div>
            <button onClick={() => signOut()} className="w-full bg-red-50 text-red-600 hover:bg-red-100 py-2 px-4 rounded-lg text-sm font-semibold transition">
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            className="lg:hidden bg-orange-50 hover:bg-orange-100 p-2 rounded-lg text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-lg font-bold text-orange-600 ml-auto">ANIMALIA</div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}