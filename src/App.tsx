import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import HomePage from './components/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardHomePage from './pages/dashboard/DashboardHomePage'
import PacientesPage from './pages/dashboard/PacientesPage'
import NuevoPacientePage from './pages/dashboard/pacientes/NuevoPacientePage'
import HistorialPage from './pages/dashboard/historial/HistorialPage'
import HistorialGeneralPage from './pages/dashboard/historial/HistorialGeneralPage'
import SolicitarCitaPage from './pages/dashboard/citas/SolicitarCitaPage'
import CitasPage from './pages/dashboard/citas/CitasPage'
import TiendaPage from './pages/dashboard/tienda/TiendaPage'
import CarritoPage from './pages/dashboard/tienda/carrito/CarritoPage'
import PedidosPage from './pages/dashboard/pedidos/PedidosPage'
import AdminPedidosPage from './pages/dashboard/admin-pedidos/AdminPedidosPage'
import AdminTiendaPage from './pages/dashboard/admin-tienda/AdminTiendaPage'
import NoticiasPage from './pages/dashboard/noticias/NoticiasPage'
import ContenidoPage from './pages/dashboard/contenido/ContenidoPage'
import VentasPage from './pages/dashboard/ventas/VentasPage'
import UsuariosPage from './pages/dashboard/usuarios/UsuariosPage'
import HerramientasPage from './pages/dashboard/herramientas/HerramientasPage'
import AgendaPage from './pages/dashboard/agenda/AgendaPage'

function App() {
  return (
    <AuthProvider>
      <HashRouter>
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
      </HashRouter>
    </AuthProvider>
  )
}

export default App