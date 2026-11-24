import type { EventType } from '../api/events'
import type { StoredConfig, TemplateConfig, TemplateDefinition, TemplateEvent, TemplateKey } from './types'

const headlines: Record<EventType, string> = {
  Wedding: '¡Nos casamos!',
  Quinceanera: 'Mis XV años',
  Other: 'Te invitamos',
}

const messages: Record<EventType, string> = {
  Wedding: 'Con la bendición de Dios y de nuestros padres, queremos compartir contigo el inicio de nuestra vida juntos.',
  Quinceanera: 'Hay momentos inolvidables que se atesoran en el corazón para siempre. Me encantaría que me acompañes a celebrar mis quince años.',
  Other: 'Nos encantaría contar con tu presencia en este día tan especial.',
}

const itineraries: Record<EventType, { time: string; label: string }[]> = {
  Wedding: [
    { time: '17:00', label: 'Ceremonia religiosa' },
    { time: '19:00', label: 'Recepción' },
    { time: '20:30', label: 'Cena' },
    { time: '22:00', label: '¡A bailar!' },
  ],
  Quinceanera: [
    { time: '18:00', label: 'Misa de acción de gracias' },
    { time: '20:00', label: 'Recepción' },
    { time: '21:00', label: 'Vals' },
    { time: '22:00', label: '¡Fiesta!' },
  ],
  Other: [
    { time: '19:00', label: 'Bienvenida' },
    { time: '20:30', label: 'Cena' },
  ],
}

function baseDefaults(event: TemplateEvent): Omit<TemplateConfig, 'colors' | 'headingFont'> {
  return {
    texts: {
      headline: headlines[event.type],
      names: event.title,
      message: messages[event.type],
      closing: '¡Te esperamos!',
    },
    sections: { countdown: true, venue: true, itinerary: true, people: false, dressCode: true, gifts: false, gallery: true },
    photos: { cover: null, gallery: [] },
    itinerary: itineraries[event.type],
    people: { parents: '', godparents: '' },
    dressCode: 'Formal',
    gifts: { message: 'Tu presencia es nuestro mejor regalo. Si deseas obsequiarnos algo, aquí está nuestra mesa de regalos.', link: '' },
  }
}

export const templates: TemplateDefinition[] = [
  {
    key: 'clasica',
    name: 'Clásica',
    description: 'Elegante y atemporal, con tipografía serif y detalles dorados.',
    defaults: (event) => ({
      ...baseDefaults(event),
      colors: { primary: '#9b6b43', background: '#fbf8f3', text: '#3d3530' },
      headingFont: 'serif',
    }),
  },
  {
    key: 'jardin',
    name: 'Jardín',
    description: 'Romántica y suave, con letra manuscrita y tonos rosados.',
    defaults: (event) => ({
      ...baseDefaults(event),
      colors: { primary: '#b0607a', background: '#fdf6f7', text: '#4a3a40' },
      headingFont: 'script',
    }),
  },
  {
    key: 'moderna',
    name: 'Moderna',
    description: 'Minimalista, con tipografía grande y mucho espacio.',
    defaults: (event) => ({
      ...baseDefaults(event),
      colors: { primary: '#1f2937', background: '#ffffff', text: '#111827' },
      headingFont: 'sans',
    }),
  },
  {
    key: 'loteria',
    name: 'Lotería',
    description: 'Cada parte de tu invitación es una carta de lotería sobre papel marfil.',
    defaults: (event) => ({
      ...baseDefaults(event),
      colors: { primary: '#a3262a', background: '#f5efe4', text: '#1a1614' },
      headingFont: 'serif',
    }),
  },
  {
    key: 'papel',
    name: 'Papel picado',
    description: 'Fiesta mexicana: banderitas de papel picado arriba y entre las secciones.',
    defaults: (event) => ({
      ...baseDefaults(event),
      colors: { primary: '#c2185b', background: '#fff8f0', text: '#2b1d1a' },
      headingFont: 'script',
    }),
  },
  {
    key: 'talavera',
    name: 'Talavera',
    description: 'Azulejo poblano: marco de mosaico y detalles en azul cobalto.',
    defaults: (event) => ({
      ...baseDefaults(event),
      colors: { primary: '#1d3f8f', background: '#fbfaf6', text: '#1c2233' },
      headingFont: 'serif',
    }),
  },
  {
    key: 'deco',
    name: 'Art déco',
    description: 'Noche de gala: abanicos geométricos, líneas dobles y dorado sobre fondo oscuro.',
    defaults: (event) => ({
      ...baseDefaults(event),
      colors: { primary: '#d4af6a', background: '#14161c', text: '#f1ead9' },
      headingFont: 'bodoni',
    }),
  },
]

export const getTemplate = (key: string): TemplateDefinition =>
  templates.find((t) => t.key === key) ?? templates[0]

/**
 * Combina la configuración guardada con los valores por defecto de la plantilla.
 * Así una invitación guardada antes de agregar un campo nuevo sigue funcionando.
 */
export function resolveConfig(key: TemplateKey | string, event: TemplateEvent, stored: StoredConfig | null | undefined): TemplateConfig {
  const d = getTemplate(key).defaults(event)
  const s = stored ?? {}
  return {
    variant: s.variant ?? d.variant,
    colors: { ...d.colors, ...s.colors },
    headingFont: s.headingFont ?? d.headingFont,
    texts: { ...d.texts, ...s.texts },
    sections: { ...d.sections, ...s.sections },
    photos: { ...d.photos, ...s.photos },
    itinerary: s.itinerary ?? d.itinerary,
    people: { ...d.people, ...s.people },
    dressCode: s.dressCode ?? d.dressCode,
    gifts: { ...d.gifts, ...s.gifts },
  }
}
