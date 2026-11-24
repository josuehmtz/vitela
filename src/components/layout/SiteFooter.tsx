import { Link } from 'react-router'
import Logo from '../brand/Logo'
import './site.css'

const YEAR = new Date().getFullYear()

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Logo size={30} />
          <p>
            Invitaciones digitales para bodas, XV años y todas las fiestas que merecen recordarse. Hecho con cariño en
            México.
          </p>
        </div>
        <nav className="site-footer-links" aria-label="Pie de página">
          <a href="/#incluye">Qué incluye</a>
          <Link to="/disenos">Diseños</Link>
          <a href="/#precios">Precios</a>
          <Link to="/login">Iniciar sesión</Link>
          <Link to="/privacidad">Aviso de privacidad</Link>
        </nav>
      </div>
      <p className="site-footer-copy">© {YEAR} Vitela. Todos los derechos reservados.</p>
    </footer>
  )
}
