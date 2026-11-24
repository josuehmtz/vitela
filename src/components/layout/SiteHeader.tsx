import { Link } from 'react-router'
import ThemeToggle from '../../theme/ThemeToggle'
import Logo from '../brand/Logo'
import './site.css'

/** Encabezado del sitio público (inicio y páginas legales). Sigue al modo activo. */
export default function SiteHeader({ links = true }: { links?: boolean }) {
  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Vitela, inicio">
        <Logo />
      </Link>
      {links && (
        <nav className="site-nav" aria-label="Secciones">
          <a href="/#incluye">Qué incluye</a>
          <Link to="/disenos">Diseños</Link>
          <a href="/#precios">Precios</a>
          <a href="/#preguntas">Preguntas</a>
        </nav>
      )}
      <div className="site-header-actions">
        <ThemeToggle />
        <Link to="/login" className="site-header-login hide-xs">
          Iniciar sesión
        </Link>
        <Link to="/login?modo=registro" className="button small">
          Crear invitación
        </Link>
      </div>
    </header>
  )
}
