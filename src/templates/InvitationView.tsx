import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { photoUrl } from '../api/photos'
import { bodyFonts, headingFonts, useTemplateFonts } from './fonts'
import type { TemplateConfig, TemplateEvent, TemplateGuest, TemplateKey } from './types'
import './templates.css'

interface Props {
  templateKey: TemplateKey
  config: TemplateConfig
  event: TemplateEvent
  guest?: TemplateGuest
  /** Espacio para la confirmación de asistencia (fase 3). */
  rsvpSlot?: ReactNode
  /** Base pública de las fotos (R2). Sin ella no se muestran fotos. */
  photoBaseUrl?: string | null
  /** El invitado ya respondió: la fecha límite para confirmar ya no le aplica. */
  rsvpAnswered?: boolean
}

const dateFmt = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const timeFmt = new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit' })
const shortDateFmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long' })
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/**
 * Una sola vista para las 3 plantillas: comparten contenido y secciones,
 * y cada una cambia tipografía, colores, ornamentos y acomodo vía CSS (.tpl-<clave>).
 */
export default function InvitationView({ templateKey, config, event, guest, rsvpSlot, photoBaseUrl, rsvpAnswered }: Props) {
  useTemplateFonts()
  const starts = new Date(event.startsAt)
  const { sections, texts } = config

  const style = {
    '--tpl-primary': config.colors.primary,
    '--tpl-bg': config.colors.background,
    '--tpl-text': config.colors.text,
    '--tpl-heading': headingFonts[config.headingFont].css,
    '--tpl-body': bodyFonts[templateKey],
  } as CSSProperties

  const hasPeople = sections.people && (config.people.parents.trim() || config.people.godparents.trim())
  const itinerary = config.itinerary.filter((i) => i.label.trim())
  const cover = photoUrl(photoBaseUrl, config.photos.cover)
  const gallery = sections.gallery
    ? config.photos.gallery.map((key) => photoUrl(photoBaseUrl, key)).filter((url): url is string => url !== null)
    : []

  return (
    <article className={`tpl tpl-${templateKey} tpl-font-${config.headingFont}`} style={style}>
      <header className="tpl-hero">
        {cover && (
          // Portada: es lo primero que se ve, así que se carga con prioridad.
          <img className="tpl-cover" src={cover} alt={texts.names || event.title} fetchPriority="high" />
        )}
        <Ornament templateKey={templateKey} />
        {texts.headline && <p className="tpl-headline">{texts.headline}</p>}
        <h1 className="tpl-names">{texts.names || event.title}</h1>
        <p className="tpl-date">
          <span className="tpl-date-day">{capitalize(dateFmt.format(starts))}</span>
          <span className="tpl-date-time">{timeFmt.format(starts)}</span>
        </p>
        <Ornament templateKey={templateKey} flip />
      </header>

      {guest && (
        <section className="tpl-section tpl-guest">
          <p className="tpl-guest-name">{guest.displayName}</p>
          <p>
            Hemos reservado <strong>{guest.passes}</strong> {guest.passes === 1 ? 'lugar' : 'lugares'} en tu honor.
          </p>
        </section>
      )}

      {texts.message && (
        <section className="tpl-section">
          <p className="tpl-message">{texts.message}</p>
        </section>
      )}

      {sections.countdown && <Countdown target={starts} />}

      {gallery.length > 0 && (
        <section className="tpl-section">
          <div className="tpl-gallery">
            {gallery.map((url, i) => (
              <img key={url} src={url} alt={`Foto ${i + 1}`} loading="lazy" decoding="async" />
            ))}
          </div>
        </section>
      )}

      {hasPeople && (
        <section className="tpl-section tpl-people">
          {config.people.parents.trim() && (
            <div>
              <h2 className="tpl-title">Con la bendición de</h2>
              <p className="tpl-multiline">{config.people.parents}</p>
            </div>
          )}
          {config.people.godparents.trim() && (
            <div>
              <h2 className="tpl-title">Padrinos</h2>
              <p className="tpl-multiline">{config.people.godparents}</p>
            </div>
          )}
        </section>
      )}

      {sections.venue && (event.venueName || event.venueAddress) && (
        <section className="tpl-section">
          <h2 className="tpl-title">¿Dónde?</h2>
          {event.venueName && <p className="tpl-strong">{event.venueName}</p>}
          {event.venueAddress && <p>{event.venueAddress}</p>}
          {event.mapsUrl && (
            <a className="tpl-button" href={event.mapsUrl} target="_blank" rel="noreferrer">
              Ver ubicación
            </a>
          )}
        </section>
      )}

      {sections.itinerary && itinerary.length > 0 && (
        <section className="tpl-section">
          <h2 className="tpl-title">Itinerario</h2>
          <ol className="tpl-itinerary">
            {itinerary.map((item, i) => (
              <li key={i}>
                <span className="tpl-itinerary-time">{item.time}</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {sections.dressCode && config.dressCode.trim() && (
        <section className="tpl-section">
          <h2 className="tpl-title">Código de vestimenta</h2>
          <p className="tpl-strong">{config.dressCode}</p>
        </section>
      )}

      {sections.gifts && (config.gifts.message.trim() || config.gifts.link.trim()) && (
        <section className="tpl-section">
          <h2 className="tpl-title">Mesa de regalos</h2>
          {config.gifts.message && <p>{config.gifts.message}</p>}
          {config.gifts.link && (
            <a className="tpl-button" href={config.gifts.link} target="_blank" rel="noreferrer">
              Ver mesa de regalos
            </a>
          )}
        </section>
      )}

      {(rsvpSlot || event.rsvpDeadline) && (
        <section className="tpl-section">
          <h2 className="tpl-title">Confirma tu asistencia</h2>
          {event.rsvpDeadline && !rsvpAnswered && (
            <p>Por favor confírmanos antes del {shortDateFmt.format(new Date(event.rsvpDeadline))}.</p>
          )}
          {rsvpSlot}
        </section>
      )}

      {texts.closing && (
        <footer className="tpl-closing">
          <p>{texts.closing}</p>
          <p className="tpl-closing-names">{texts.names || event.title}</p>
        </footer>
      )}
    </article>
  )
}

function Countdown({ target }: { target: Date }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = target.getTime() - now
  // Si el evento ya pasó, la cuenta regresiva no se muestra.
  if (diff <= 0) return null
  const parts = [
    { value: Math.floor(diff / 86_400_000), label: 'días' },
    { value: Math.floor(diff / 3_600_000) % 24, label: 'horas' },
    { value: Math.floor(diff / 60_000) % 60, label: 'min' },
    { value: Math.floor(diff / 1000) % 60, label: 'seg' },
  ]

  return (
    <section className="tpl-section">
      <div className="tpl-countdown" role="timer" aria-label="Cuenta regresiva">
        {parts.map((p) => (
          <div key={p.label}>
            <span className="tpl-countdown-value">{p.value}</span>
            <span className="tpl-countdown-label">{p.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Adorno decorativo distinto por plantilla. */
function Ornament({ templateKey, flip }: { templateKey: TemplateKey; flip?: boolean }) {
  if (templateKey === 'moderna') return <span className="tpl-rule" aria-hidden />
  if (templateKey === 'loteria')
    return (
      <svg className="tpl-ornament" viewBox="0 0 200 16" aria-hidden>
        <path d="M14 8 H84 M116 8 H186" stroke="currentColor" strokeWidth="0.8" />
        {[92, 100, 108].map((x) => (
          <path key={x} d={`M${x} 4 L${x + 4} 8 L${x} 12 L${x - 4} 8 Z`} fill={x === 100 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="0.9" />
        ))}
      </svg>
    )

  if (templateKey === 'papel') return <PapelPicado small={flip} />

  const transform = flip ? 'scale(1,-1)' : undefined
  if (templateKey === 'talavera')
    return (
      <svg className="tpl-ornament tpl-ornament-tiles" viewBox="0 0 108 36" aria-hidden>
        {[0, 36, 72].map((x, i) => (
          <g key={x} transform={`translate(${x} 0)`}>
            <rect x="1" y="1" width="34" height="34" fill={i === 1 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2" />
            {/* Flor de cuatro pétalos y cuartos de círculo en las esquinas, como el azulejo poblano */}
            <g style={{ fill: i === 1 ? 'var(--tpl-bg)' : 'currentColor' }}>
              <circle cx="18" cy="11" r="4" />
              <circle cx="18" cy="25" r="4" />
              <circle cx="11" cy="18" r="4" />
              <circle cx="25" cy="18" r="4" />
            </g>
            <circle cx="18" cy="18" r="2.6" style={{ fill: i === 1 ? 'currentColor' : 'var(--tpl-bg)' }} stroke={i === 1 ? 'none' : 'currentColor'} strokeWidth="1" />
            {[[1, 1], [35, 1], [1, 35], [35, 35]].map(([cx, cy]) => (
              <path key={`${cx}-${cy}`} d={`M${cx} ${cy + (cy === 1 ? 7 : -7)} A7 7 0 0 ${cx === cy ? 1 : 0} ${cx + (cx === 1 ? 7 : -7)} ${cy}`} fill="none" stroke={i === 1 ? 'var(--tpl-bg)' : 'currentColor'} strokeWidth="1" style={{ stroke: i === 1 ? 'var(--tpl-bg)' : undefined }} />
            ))}
          </g>
        ))}
      </svg>
    )
  if (templateKey === 'deco')
    return (
      <svg className="tpl-ornament tpl-ornament-fan" viewBox="0 0 200 48" aria-hidden style={{ transform }}>
        {/* Abanico art déco: rayos desde el centro y arcos escalonados */}
        {Array.from({ length: 9 }, (_, i) => {
          const a = Math.PI - (i * Math.PI) / 8
          return <line key={i} x1="100" y1="46" x2={100 + Math.cos(a) * 40} y2={46 - Math.sin(a) * 40} stroke="currentColor" strokeWidth="0.9" />
        })}
        <path d="M60 46 A40 40 0 0 1 140 46" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M74 46 A26 26 0 0 1 126 46" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M88 46 A12 12 0 0 1 112 46 Z" fill="currentColor" />
        <path d="M8 46 H54 M146 46 H192 M20 41 H50 M150 41 H180" stroke="currentColor" strokeWidth="0.9" />
      </svg>
    )
  if (templateKey === 'jardin')
    return (
      <svg className="tpl-ornament" viewBox="0 0 200 40" aria-hidden style={{ transform }}>
        <path d="M100 30 C 80 30, 60 10, 20 14" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M100 30 C 120 30, 140 10, 180 14" fill="none" stroke="currentColor" strokeWidth="1.2" />
        {[40, 62, 138, 160].map((x, i) => (
          <ellipse key={x} cx={x} cy={i % 2 ? 16 : 20} rx="7" ry="3.2" fill="currentColor" opacity="0.55"
            transform={`rotate(${x < 100 ? -25 : 25} ${x} ${i % 2 ? 16 : 20})`} />
        ))}
        <circle cx="100" cy="30" r="4" fill="currentColor" />
      </svg>
    )

  return (
    <svg className="tpl-ornament" viewBox="0 0 200 20" aria-hidden style={{ transform }}>
      <line x1="10" y1="10" x2="80" y2="10" stroke="currentColor" strokeWidth="0.8" />
      <line x1="120" y1="10" x2="190" y2="10" stroke="currentColor" strokeWidth="0.8" />
      <path d="M100 3 L107 10 L100 17 L93 10 Z" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="86" cy="10" r="1.6" fill="currentColor" />
      <circle cx="114" cy="10" r="1.6" fill="currentColor" />
    </svg>
  )
}

/** Banderitas de papel picado colgadas de un hilo (los recortes dejan ver el fondo). */
function PapelPicado({ small }: { small?: boolean }) {
  const flags = small ? 5 : 7
  const w = 200 / flags
  return (
    <svg className={`tpl-papel-picado${small ? ' small' : ''}`} viewBox="0 0 200 44" aria-hidden>
      <path d="M0 4 Q100 12 200 4" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
      {Array.from({ length: flags }, (_, i) => {
        const x = i * w + 2
        const fw = w - 4
        const y = 5 + Math.sin((i / (flags - 1)) * Math.PI) * 3.5
        const teeth = 5
        const tw = fw / teeth
        const zig = Array.from({ length: teeth }, (_, t) => `L${x + fw - t * tw - tw / 2} ${y + 34} L${x + fw - (t + 1) * tw} ${y + 30}`).join(' ')
        return (
          <g key={i} opacity={i % 2 ? 0.72 : 1}>
            <path d={`M${x} ${y} H${x + fw} V${y + 30} ${zig} Z`} fill="currentColor" />
            {/* Recortes del papel */}
            <g style={{ fill: 'var(--tpl-bg)' }}>
              <path d={`M${x + fw / 2} ${y + 7} l5 6 -5 6 -5 -6 z`} />
              <circle cx={x + fw / 2 - 7} cy={y + 13} r="1.8" />
              <circle cx={x + fw / 2 + 7} cy={y + 13} r="1.8" />
              <circle cx={x + fw / 2} cy={y + 24} r="2.2" />
              <rect x={x + 3} y={y + 3} width={fw - 6} height="1.4" />
            </g>
          </g>
        )
      })}
    </svg>
  )
}

