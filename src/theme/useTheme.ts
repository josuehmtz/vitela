import { useCallback, useEffect, useState } from 'react'

export type ThemePreference = 'system' | 'light' | 'dark'

const KEY = 'vitela-theme'
/** Clave del nombre anterior: se sigue leyendo para no perder la preferencia guardada. */
const OLD_KEY = 'lacre-theme'
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

/** ?tema=claro|oscuro fuerza el modo solo en esa visita (para compartir o revisar capturas). */
function urlTheme(): 'light' | 'dark' | null {
  const q = new URLSearchParams(window.location.search).get('tema')
  return q === 'claro' ? 'light' : q === 'oscuro' ? 'dark' : null
}

function readPreference(): ThemePreference {
  const forced = urlTheme()
  if (forced) return forced
  try {
    const v = localStorage.getItem(KEY) ?? localStorage.getItem(OLD_KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

const resolve = (pref: ThemePreference): 'light' | 'dark' =>
  pref === 'system' ? (darkQuery().matches ? 'dark' : 'light') : pref

/** Pone el modo en html[data-theme]. Con fade, cruza colores en 200 ms (nunca con movimiento reducido). */
function apply(pref: ThemePreference, fade: boolean) {
  const root = document.documentElement
  const next = resolve(pref)
  if (root.dataset.theme === next) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (fade && !reduced) {
    root.classList.add('theme-fading')
    window.setTimeout(() => root.classList.remove('theme-fading'), 260)
  }
  root.dataset.theme = next
}

/**
 * Modo del sitio. En la primera visita sigue al sistema (y a sus cambios); cuando el usuario elige claro u
 * oscuro con el botón, se guarda en este navegador.
 */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readPreference)
  const [changed, setChanged] = useState(false)

  useEffect(() => apply(preference, changed), [preference, changed])

  // En "sistema", seguir al sistema si cambia mientras la página está abierta.
  useEffect(() => {
    if (preference !== 'system') return
    const mq = darkQuery()
    const onChange = () => apply('system', true)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])

  const change = useCallback((pref: ThemePreference) => {
    try {
      if (pref === 'system') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, pref)
    } catch {
      // Sin almacenamiento (modo privado): el modo aplica solo en esta visita.
    }
    setChanged(true)
    setPreference(pref)
  }, [])

  return { preference, setPreference: change }
}

/** Modo que se ve en pantalla en este momento. */
export function currentTheme(): 'light' | 'dark' {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}
