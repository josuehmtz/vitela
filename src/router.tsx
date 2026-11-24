import { createBrowserRouter } from 'react-router'
import AppLayout from './components/AppLayout'
import DashboardPage from './pages/DashboardPage'
import EventPage from './pages/EventPage'
import HomePage from './pages/HomePage'
import InvitationPage from './pages/InvitationPage'
import LoginPage from './pages/LoginPage'

// Páginas pesadas (editor de diseño, plano con Konva, escáner con cámara) se cargan solo al abrirlas,
// para que la invitación pública que abren los invitados sea ligera.
const lazyPage = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await load()).default,
})

export const router = createBrowserRouter([
  // Sitio público: paquetes y precios.
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/privacidad', lazy: lazyPage(() => import('./pages/PrivacyPage')) },
  { path: '/disenos', lazy: lazyPage(() => import('./pages/DesignsPage')) },
  // Panel del cliente (requiere sesión).
  {
    path: '/app',
    element: <AppLayout />,
    hydrateFallbackElement: <main className="page">Cargando…</main>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'events/:id', element: <EventPage /> },
      { path: 'events/:id/design', lazy: lazyPage(() => import('./pages/DesignPage')) },
      { path: 'events/:id/seating', lazy: lazyPage(() => import('./pages/SeatingPage')) },
      { path: 'events/:id/lista', lazy: lazyPage(() => import('./pages/GuestListPrintPage')) },
      // Link de un salón (cliente de un evento) o de Vitela (personal de un salón).
      { path: 'unirse/:token', lazy: lazyPage(() => import('./pages/JoinPage')) },
      { path: 'admin', lazy: lazyPage(() => import('./pages/AdminPage')) },
    ],
  },
  // Invitación pública de cada invitado (link y QR).
  { path: '/i/:token', element: <InvitationPage /> },
  // Hostess el día del evento.
  { path: '/staff', lazy: lazyPage(() => import('./pages/ScannerPage')) },
  { path: '/staff/:accessId', lazy: lazyPage(() => import('./pages/ScannerPage')) },
])
