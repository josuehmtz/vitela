import { useEffect } from 'react'
import type { HeadingFont, TemplateKey } from './types'

// Google Fonts (gratuitas). Se cargan solo en páginas que muestran invitaciones.
const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Great+Vibes&family=Montserrat:wght@300;400;600&family=Playfair+Display:wght@400;600&display=swap'

export function useTemplateFonts() {
  useEffect(() => {
    if (document.getElementById('template-fonts')) return
    const link = document.createElement('link')
    link.id = 'template-fonts'
    link.rel = 'stylesheet'
    link.href = FONTS_URL
    document.head.appendChild(link)
  }, [])
}

export const headingFonts: Record<HeadingFont, { label: string; css: string }> = {
  serif: { label: 'Elegante (Playfair)', css: "'Playfair Display', Georgia, serif" },
  script: { label: 'Manuscrita (Great Vibes)', css: "'Great Vibes', 'Brush Script MT', cursive" },
  sans: { label: 'Moderna (Montserrat)', css: "'Montserrat', system-ui, sans-serif" },
  // Bodoni Moda viene con el sitio (index.css): no se descarga aparte.
  bodoni: { label: 'De gala (Bodoni)', css: "'Bodoni Moda', Didot, Georgia, serif" },
}

export const bodyFonts: Record<TemplateKey, string> = {
  clasica: "'Cormorant Garamond', Georgia, serif",
  jardin: "'Cormorant Garamond', Georgia, serif",
  moderna: "'Montserrat', system-ui, sans-serif",
  // Bodoni Moda ya viene con el sitio (index.css); es la letra de las cartas de Vitela.
  loteria: "'Bodoni Moda', Georgia, serif",
  papel: "'Cormorant Garamond', Georgia, serif",
  talavera: "'Cormorant Garamond', Georgia, serif",
  deco: "'Montserrat', system-ui, sans-serif",
}
