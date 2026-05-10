import { useEffect } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'

export default function DashboardLayout() {
  const { user, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) return <div className="flex justify-center items-center min-h-screen">Cargando...</div>
  if (!user || !profile) return null

  const menuItems = [
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
  ]

  const filteredMenu = menuItems.filter(item => item.roles.includes(profile.role))

  return (
   <div className="flex h-screen bg-white dark:bg-gray-950">
      <aside className="w-64 bg-white dark:bg-gray-900 shadow-lg p-4 flex flex-col">
        <div className="text-xl font-bold text-orange-600 mb-6">🐾 ANIMALIA</div>
        <nav className="flex-1 space-y-1">
          {filteredMenu.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-100 dark:hover:bg-gray-800 hover:text-orange-600 transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t pt-4 mt-4">
          <p className="text-sm font-semibold">{profile.nombre_completo || 'Usuario'}</p>
          <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
          <button onClick={signOut} className="text-red-600 hover:underline text-sm mt-2">
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}