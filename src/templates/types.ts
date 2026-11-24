import type { EventType } from '../api/events'

export type TemplateKey = 'clasica' | 'jardin' | 'moderna' | 'loteria' | 'papel' | 'talavera' | 'deco'
export type HeadingFont = 'serif' | 'script' | 'sans' | 'bodoni'

export interface ItineraryItem {
  time: string
  label: string
}

/** Personalización que guarda el cliente (jsonb en el backend). */
export interface TemplateConfig {
  /** Diseño del catálogo con el que se empezó (estructura + colores + letra), p. ej. "papel-fiesta". */
  variant?: string
  colors: { primary: string; background: string; text: string }
  headingFont: HeadingFont
  texts: {
    headline: string
    names: string
    message: string
    closing: string
  }
  sections: {
    countdown: boolean
    venue: boolean
    itinerary: boolean
    people: boolean
    dressCode: boolean
    gifts: boolean
    gallery: boolean
  }
  /** Llaves de las fotos en R2 (la URL se arma con photoBaseUrl). */
  photos: { cover: string | null; gallery: string[] }
  itinerary: ItineraryItem[]
  people: { parents: string; godparents: string }
  dressCode: string
  gifts: { message: string; link: string }
}

/** Datos del evento que necesita una plantilla para pintarse. */
export interface TemplateEvent {
  title: string
  type: EventType
  startsAt: string
  venueName: string | null
  venueAddress: string | null
  mapsUrl: string | null
  rsvpDeadline: string | null
  /** Ceremonia en otro lugar (iglesia, juzgado…): opcional. */
  ceremonyName?: string | null
  ceremonyAddress?: string | null
  ceremonyMapsUrl?: string | null
  ceremonyStartsAt?: string | null
}

export interface TemplateGuest {
  displayName: string
  passes: number
}

export interface TemplateDefinition {
  key: TemplateKey
  name: string
  description: string
  defaults: (event: TemplateEvent) => TemplateConfig
}

/** Valores parciales guardados: el backend puede tener configuraciones de versiones anteriores. */
export type StoredConfig = Partial<{
  [K in keyof TemplateConfig]: TemplateConfig[K] extends unknown[]
    ? TemplateConfig[K]
    : TemplateConfig[K] extends object
      ? Partial<TemplateConfig[K]>
      : TemplateConfig[K]
}>
