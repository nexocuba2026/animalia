import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import { lazy, Suspense } from 'react'

// Carga estática para las páginas principales (necesarias al instante)
import HomePage from './components/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardHomePage from './pages/dashboard/DashboardHomePage'

// Carga diferida (lazy) para el resto de páginas
const PacientesPage = lazy(() => import('./pages/dashboard/PacientesPage'))
const NuevoPacientePage = lazy(() => import('./pages/dashboard/pacientes/NuevoPacientePage'))
const HistorialPage = lazy(() => import('./pages/dashboard/historial/HistorialPage'))
const HistorialGeneralPage = lazy(() => import('./pages/dashboard/historial/HistorialGeneralPage'))
const SolicitarCitaPage = lazy(() => import('./pages/dashboard/citas/SolicitarCitaPage'))
const CitasPage = lazy(() => import('./pages/dashboard/citas/CitasPage'))
const TiendaPage = lazy(() => import('./pages/dashboard/tienda/TiendaPage'))
const CarritoPage = lazy(() => import('./pages/dashboard/tienda/carrito/CarritoPage'))
const PedidosPage = lazy(() => import('./pages/dashboard/pedidos/PedidosPage'))
const AdminPedidosPage = lazy(() => import('./pages/dashboard/admin-pedidos/AdminPedidosPage'))
const AdminTiendaPage = lazy(() => import('./pages/dashboard/admin-tienda/AdminTiendaPage'))
const NoticiasPage = lazy(() => import('./pages/dashboard/noticias/NoticiasPage'))
const ContenidoPage = lazy(() => import('./pages/dashboard/contenido/ContenidoPage'))
const VentasPage = lazy(() => import('./pages/dashboard/ventas/VentasPage'))
const UsuariosPage = lazy(() => import('./pages/dashboard/usuarios/UsuariosPage'))
const HerramientasPage = lazy(() => import('./pages/dashboard/herramientas/HerramientasPage'))
const AgendaPage = lazy(() => import('./pages/dashboard/agenda/AgendaPage'))

// Componente simple para mostrar mientras se carga una página
const Loading = () => <div className="flex justify-center items-center h-64">Cargando página...</div>

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHomePage />} />
              <Route path="pacientes" element={<PacientesPage />} />
              <Route path="pacientes/nuevo" element={<NuevoPacientePage />} />
              <Route path="historial" element={<HistorialGeneralPage />} />
              <Route path="historial/:id" element={<HistorialPage />} />
              <Route path="citas/solicitar" element={<SolicitarCitaPage />} />
              <Route path="citas" element={<CitasPage />} />
              <Route path="tienda" element={<TiendaPage />} />
              <Route path="tienda/carrito" element={<CarritoPage />} />
              <Route path="pedidos" element={<PedidosPage />} />
              <Route path="admin-pedidos" element={<AdminPedidosPage />} />
              <Route path="admin-tienda" element={<AdminTiendaPage />} />
              <Route path="noticias" element={<NoticiasPage />} />
              <Route path="contenido" element={<ContenidoPage />} />
              <Route path="ventas" element={<VentasPage />} />
              <Route path="usuarios" element={<UsuariosPage />} />
              <Route path="herramientas" element={<HerramientasPage />} />
              <Route path="agenda" element={<AgendaPage />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </AuthProvider>
  )
}

export default App