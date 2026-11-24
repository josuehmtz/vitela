import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { tiltFor } from './brand/tilt'
import { getTemplate, resolveConfig } from '../templates/registry'
import type { CatalogDesign } from '../templates/catalog'
import InvitationView from '../templates/InvitationView'
import type { TemplateEvent } from '../templates/types'
import type { EventType } from '../api/events'
import './design-card.css'

// Fechas de ejemplo siempre en el futuro, para que la cuenta regresiva se vea.
const inMonths = (m: number, hour: number) => {
  const d = new Date()
  d.setMonth(d.getMonth() + m, 14)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

/** Evento de ejemplo según el tipo de fiesta que se está viendo. */
const samples: Record<EventType, { event: TemplateEvent; guest: string; passes: number }> = {
  Wedding: {
    event: { title: 'Valeria & Tomás', type: 'Wedding', startsAt: inMonths(6, 18), venueName: 'Hacienda Los Arcángeles', venueAddress: 'San Miguel de Allende, Gto.', mapsUrl: null, rsvpDeadline: null, ceremonyName: 'Parroquia de San Miguel Arcángel', ceremonyAddress: 'Centro, San Miguel de Allende', ceremonyStartsAt: inMonths(6, 17) },
    guest: 'Familia Robles',
    passes: 4,
  },
  Quinceanera: {
    event: { title: 'Sofía', type: 'Quinceanera', startsAt: inMonths(3, 20), venueName: 'Jardín Las Magnolias', venueAddress: 'Guadalajara, Jalisco', mapsUrl: null, rsvpDeadline: null },
    guest: 'Tíos Ramírez',
    passes: 2,
  },
  Other: {
    event: { title: 'Los 50 de Laura', type: 'Other', startsAt: inMonths(2, 19), venueName: 'Terraza San Ángel', venueAddress: 'Ciudad de México', mapsUrl: null, rsvpDeadline: null },
    guest: 'Familia Ortega',
    passes: 3,
  },
}

/** Pinta la invitación solo cuando la carta se acerca a la pantalla (el catálogo tiene decenas). */
function useNearViewport(eager: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(() => eager || typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    if (near || !ref.current) return
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setNear(true)
        io.disconnect()
      }
    }, { rootMargin: '400px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [near])
  return { ref, near }
}

/** Un diseño del catálogo como carta de lotería: papel marfil, foil y número; la invitación es su dibujo. */
export default function DesignCard({ design, number, eager = false, caption, eventType }: {
  design: CatalogDesign
  number: number
  /** Tipo de fiesta del ejemplo (el filtro activo); sin él, el primero para el que se sugiere el diseño. */
  eventType?: EventType
  /** true para las cartas que se ven al cargar; las demás se pintan al acercarse. */
  eager?: boolean
  caption?: string
}) {
  const { ref, near } = useNearViewport(eager)
  const sample = samples[eventType ?? design.events[0]]
  const structure = getTemplate(design.structure)
  const config = { ...resolveConfig(design.structure, sample.event, null), colors: design.colors, headingFont: design.headingFont }

  return (
    <figure className="design-card" style={{ '--tilt': `${tiltFor(number)}deg` } as CSSProperties}>
      <div className="design-face paper-card" aria-hidden>
        <span className="card-box">{number}</span>
        <div className="design-screen" ref={ref} style={{ background: design.colors.background }}>
          {near && (
            <div className="device-content">
              <InvitationView
                templateKey={design.structure}
                config={config}
                event={sample.event}
                guest={{ displayName: sample.guest, passes: sample.passes }}
              />
            </div>
          )}
        </div>
        <strong className="card-caption">{structure.name}</strong>
      </div>
      <figcaption>
        <strong className="design-variant">{design.name}</strong> · {caption ?? design.tagline}
      </figcaption>
    </figure>
  )
}
