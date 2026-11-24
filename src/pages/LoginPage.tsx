import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { getProviders, googleLoginUrl, login, register } from '../api/auth'
import { ArtInvitacion, ArtPalomita, LoteriaCard } from '../components/brand/Loteria'
import Logo from '../components/brand/Logo'
import ThemeToggle from '../theme/ThemeToggle'
import './auth.css'

const googleErrors: Record<string, string> = {
  google: 'No pudimos iniciar sesión con Google. Intenta de nuevo o usa tu correo.',
  bloqueado: 'Tu cuenta está bloqueada temporalmente. Intenta más tarde.',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [params] = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>(params.get('modo') === 'registro' ? 'register' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const providers = useQuery({ queryKey: ['auth-providers'], queryFn: getProviders, staleTime: Infinity })
  const urlError = params.get('error')
  // Solo rutas internas del panel (evita redirigir a sitios ajenos).
  const requested = params.get('returnUrl')
  const returnUrl = requested && requested.startsWith('/app') ? requested : '/app'

  const submit = useMutation({
    mutationFn: async () => {
      if (mode === 'register') await register({ email, password })
      await login({ email, password })
    },
    onSuccess: () => {
      // Descarta un "sin sesión" cacheado de una visita anterior a /app.
      queryClient.removeQueries({ queryKey: ['me'] })
      navigate(returnUrl)
    },
  })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit.mutate()
  }

  const registering = mode === 'register'

  return (
    <div className="auth">
      <aside className="auth-aside invert-scheme" aria-hidden>
        <Link to="/" className="auth-aside-logo" tabIndex={-1}>
          <Logo />
        </Link>
        <div className="auth-aside-body">
          <div className="auth-cards">
            <LoteriaCard number={1} name="LA INVITACIÓN" ground="rojo">
              <ArtInvitacion />
            </LoteriaCard>
            <LoteriaCard number={2} name="LA PALOMITA" ground="azul">
              <ArtPalomita />
            </LoteriaCard>
          </div>
          <blockquote>
            “Cada gran celebración
            <br />
            comienza con una invitación.”
          </blockquote>
          <ul>
            <li>Sabes quién va, al momento</li>
            <li>Un pase de entrada para cada familia</li>
            <li>Tu salón y tus mesas, a tu manera</li>
          </ul>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-top">
          <Link to="/" className="brand auth-mobile-logo" aria-label="Vitela, inicio">
            <Logo size={30} />
          </Link>
          <ThemeToggle />
        </div>

        <div className="auth-card">
          <div>
            <h1>{registering ? 'Crea tu cuenta' : 'Inicia sesión'}</h1>
            <p className="muted">
              {registering
                ? 'Arma tu invitación con calma y envíala cuando todo esté perfecto.'
                : 'Qué gusto verte. Sigamos preparando tu celebración.'}
            </p>
          </div>

          {urlError && googleErrors[urlError] && (
            <p className="notice notice-error" role="alert">
              {googleErrors[urlError]}
            </p>
          )}

          {providers.data?.google && (
            <>
              <a className="google-button" href={googleLoginUrl(returnUrl)}>
                <GoogleIcon />
                Continuar con Google
              </a>
              <div className="divider">
                <span>o con tu correo</span>
              </div>
            </>
          )}

          <form onSubmit={onSubmit} className="form">
            <label>
              Correo electrónico
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                autoComplete={registering ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              {registering && (
                <span className="muted small">
                  Al menos 8 caracteres, con una mayúscula, una minúscula y un número.
                </span>
              )}
            </label>
            {submit.isError && (
              <p className="error small" role="alert">
                {submit.error.message}
              </p>
            )}
            <button type="submit" className="big" disabled={submit.isPending}>
              {submit.isPending ? 'Un momento…' : registering ? 'Crear cuenta' : 'Entrar'}
            </button>
          </form>

          {registering && (
            <p className="center muted small">
              Al crear tu cuenta aceptas nuestro <Link to="/privacidad">aviso de privacidad</Link>.
            </p>
          )}
          <p className="center muted small">
            {registering ? '¿Ya tienes cuenta? ' : '¿Aún no tienes cuenta? '}
            <button
              type="button"
              className="link"
              onClick={() => {
                // El error del otro formulario no aplica al cambiar de modo.
                submit.reset()
                setMode(registering ? 'login' : 'register')
              }}
            >
              {registering ? 'Inicia sesión' : 'Regístrate gratis'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  )
}
