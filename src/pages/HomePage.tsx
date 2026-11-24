import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { Link } from 'react-router'
import { formatMxn } from '../api/billing'
import { getPlans, type Plan } from '../api/client'
import {
  ArtCampana,
  ArtEscalera,
  ArtInvitacion,
  ArtMano,
  ArtMesa,
  ArtPalomita,
  ArtPase,
  ArtPeso,
  ArtRosa,
  ArtSalon,
  Frijol,
  LoteriaCard,
  type Tinta,
} from '../components/brand/Loteria'
import { tiltFor } from '../components/brand/tilt'
import SiteFooter from '../components/layout/SiteFooter'
import SiteHeader from '../components/layout/SiteHeader'
import { CONTACT_EMAIL } from '../lib/site'
import DesignCard from '../components/DesignCard'
import { catalog, findDesign, type CatalogDesign } from '../templates/catalog'
import './home.css'

// Fechas de ejemplo siempre en el futuro, para que la cuenta regresiva se vea.
const inMonths = (m: number, hour: number) => {
  const d = new Date()
  d.setMonth(d.getMonth() + m, 14)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const tilt = (number: number) => ({ '--tilt': `${tiltFor(number)}deg` }) as CSSProperties

/**
 * Paquetes de respaldo: se muestran mientras llegan los precios de la API o si no responde.
 * Deben coincidir con los de la base de datos (migración PlanMarketPrices: 890 / 1,490 / 2,190 MXN).
 */
const FALLBACK_PLANS: Plan[] = [
  { code: 'basico', name: 'Básico', maxPasses: 100, priceMxn: 890 },
  { code: 'estandar', name: 'Estándar', maxPasses: 250, priceMxn: 1490 },
  { code: 'premium', name: 'Premium', maxPasses: 500, priceMxn: 2190 },
]

/** Cuatro diseños para la portada: uno de cada estructura más "Vitela"; el resto vive en /disenos. */
const featured = ['loteria-carmin', 'papel-fiesta', 'talavera-cobalto', 'deco-oro']
  .map(findDesign)
  .filter((x): x is CatalogDesign => Boolean(x))

/** Fecha del evento de muestra que corre en la carta de El Pase. */
const SAMPLE_PARTY = inMonths(5, 17)

/* ---------------------------------------------------------------------------
   Carrusel en celular: deslizar con scroll-snap y puntos que dicen dónde vas
   --------------------------------------------------------------------------- */

function useSnapIndex(ref: RefObject<HTMLElement | null>) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const items = [...el.children] as HTMLElement[]
      const left = el.scrollLeft
      let best = 0
      items.forEach((item, i) => {
        if (Math.abs(item.offsetLeft - el.offsetLeft - left) < Math.abs(items[best].offsetLeft - el.offsetLeft - left)) best = i
      })
      setIndex(best)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [ref])
  return index
}

function Dots({ count, index, target, label }: { count: number; index: number; target: RefObject<HTMLElement | null>; label: string }) {
  const go = (i: number) => {
    const el = target.current
    const item = el?.children[i] as HTMLElement | undefined
    if (!el || !item) return
    el.scrollTo({ left: item.offsetLeft - el.offsetLeft - parseFloat(getComputedStyle(el).scrollPaddingLeft || '0'), behavior: reducedMotion() ? 'auto' : 'smooth' })
  }
  return (
    <div className="dots" role="group" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <button key={i} type="button" className="dot" aria-label={`Ver la ${i + 1} de ${count}`} aria-current={i === index || undefined} onClick={() => go(i)} />
      ))}
      <span className="dots-count" aria-hidden>
        {index + 1} / {count}
      </span>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Portada: las cuatro cartas del camino de cada invitado
   --------------------------------------------------------------------------- */

const deck: { number: number; name: string; ground: Tinta; art: ReactNode; title: string; text: string }[] = [
  { number: 1, name: 'LA INVITACIÓN', ground: 'rojo', art: <ArtInvitacion />, title: 'La invitación', text: 'Le llega por WhatsApp, con su nombre y sus lugares.' },
  { number: 2, name: 'LA PALOMITA', ground: 'azul', art: <ArtPalomita />, title: 'La palomita', text: 'Confirma con un toque y tú lo ves al momento.' },
  { number: 3, name: 'EL PASE', ground: 'oro', art: <ArtPase />, title: 'El pase', text: 'Su pase de entrada le llega solo, listo para la puerta.' },
  { number: 4, name: 'LA MESA', ground: 'verde', art: <ArtMesa />, title: 'La mesa', text: 'En la entrada lo escanean y va directo a su lugar.' },
]

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = Math.max(0, new Date(target).getTime() - now)
  const days = Math.floor(diff / 86_400_000)
  const pad = (n: number) => String(n).padStart(2, '0')
  const h = pad(Math.floor(diff / 3_600_000) % 24)
  const m = pad(Math.floor(diff / 60_000) % 60)
  const s = pad(Math.floor(diff / 1000) % 60)
  return `${days} días ${h}:${m}:${s}`
}

function HeroDeck() {
  // La carta "cantada" recorre la fila una sola vez y se queda en La Mesa, con la familia ya confirmada.
  // Con movimiento reducido se muestra directo el final.
  const [active, setActive] = useState(() => (reducedMotion() ? 3 : 0))
  const countdown = useCountdown(SAMPLE_PARTY)
  const row = useRef<HTMLOListElement>(null)
  const shown = useSnapIndex(row)
  useEffect(() => {
    if (reducedMotion()) return
    let id = 0
    // Primero se reparten las cartas; después se canta una por una.
    const start = window.setTimeout(() => {
      id = window.setInterval(
        () =>
          setActive((a) => {
            if (a >= 2) window.clearInterval(id)
            return Math.min(a + 1, 3)
          }),
        2000,
      )
    }, 1400)
    return () => {
      window.clearTimeout(start)
      window.clearInterval(id)
    }
  }, [])
  const confirmed = active >= 1

  return (
    <div className="deck-wrap">
      <ol className="deck" ref={row} aria-label="El camino de cada invitado">
        {deck.map((c, i) => (
          <li key={c.number} className="deck-item" data-active={i === active || undefined} style={{ '--i': i } as CSSProperties}>
            <div className={`deck-card${c.number === 2 && !confirmed ? ' is-pending' : ''}`}>
              <LoteriaCard number={c.number} name={c.name} ground={c.ground} label={c.title}>
                {c.art}
              </LoteriaCard>
            </div>
            <p className="deck-caption">
              <strong>{c.title}</strong>
              {c.number === 2 ? (
                <span>{confirmed ? 'Familia Pérez: 4 lugares, ¡ahí estaremos!' : 'Esperando respuesta…'}</span>
              ) : c.number === 3 ? (
                <span>
                  {c.text} <span className="deck-countdown">Faltan {countdown}</span>
                </span>
              ) : (
                <span>{c.text}</span>
              )}
            </p>
          </li>
        ))}
      </ol>
      <Dots count={deck.length} index={shown} target={row} label="Cartas del camino del invitado" />
    </div>
  )
}

/* ---------------------------------------------------------------------------
   La tabla: todo lo que viene incluido, cantado como en la lotería
   --------------------------------------------------------------------------- */

const tabla: { number: number; name: string; ground: Tinta; art: ReactNode; verse: string; title: string; text: string }[] = [
  {
    number: 5, name: 'EL SALÓN', ground: 'azul', art: <ArtSalon />,
    verse: 'Cada quien junto a quien quieras.',
    title: 'Tus mesas, a tu manera',
    text: 'Dibuja tu salón, acomoda las mesas donde van y sienta a cada invitado en su lugar.',
  },
  {
    number: 6, name: 'LA MANO', ground: 'rojo', art: <ArtMano />,
    verse: 'La que recibe sin hacer fila.',
    title: 'Una recepción sin filas',
    text: 'Tus hostess solo necesitan su celular para recibir a todos, y si en el salón se va la señal, siguen recibiendo.',
  },
  {
    number: 7, name: 'LA CAMPANA', ground: 'verde', art: <ArtCampana />,
    verse: 'Tilín, tilín: el tío que no contesta.',
    title: 'Recordatorios con cariño',
    text: '¿Alguien no ha respondido? Mándale un recordatorio por WhatsApp, ya escrito, con un toque.',
  },
  {
    number: 8, name: 'LA ROSA', ground: 'oro', art: <ArtRosa />,
    verse: 'Con tus colores y tus fotos.',
    title: 'Tu invitación, tu estilo',
    text: 'Elige un diseño, cámbiale colores, textos y fotos, y mírala tal cual la verán tus invitados.',
  },
  {
    number: 9, name: 'LA ESCALERA', ground: 'azul', art: <ArtEscalera />,
    verse: 'Si la lista crece, sube un escalón.',
    title: 'Crece contigo',
    text: '¿Al final invitaste a más? Cambias a un paquete más grande y solo pagas la diferencia.',
  },
  {
    number: 10, name: 'EL PESO', ground: 'verde', art: <ArtPeso />,
    verse: 'Un solo pago y a bailar.',
    title: 'Paga como prefieras',
    text: 'Con tarjeta o en efectivo en OXXO. Un solo pago por tu evento, sin mensualidades.',
  },
]

function Tabla() {
  const ref = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const cells = [...root.querySelectorAll<HTMLElement>('.tabla-cell')]
    if (reducedMotion() || !('IntersectionObserver' in window)) {
      cells.forEach((c) => c.classList.add('is-marked'))
      return
    }
    // Cada carta se "canta" (se le pone su frijolito) cuando entra a la vista.
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-marked')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.3 },
    )
    cells.forEach((c) => io.observe(c))
    return () => io.disconnect()
  }, [])

  return (
    <ol className="tabla" ref={ref}>
      {tabla.map((c) => (
        <li key={c.number} className="tabla-cell">
          <div className="tabla-card">
            <LoteriaCard number={c.number} name={c.name} ground={c.ground} label={c.title}>
              {c.art}
            </LoteriaCard>
            <Frijol />
          </div>
          <div className="tabla-text">
            <h3>{c.title}</h3>
            <p>{c.text}</p>
            <p className="tabla-verse">«{c.verse}»</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/* ---------------------------------------------------------------------------
   Página
   --------------------------------------------------------------------------- */

const included = [
  'Todos los diseños, con tus colores y textos',
  'Confirmaciones y pases de entrada',
  'Tu salón y el acomodo de mesas',
  'Todas las hostess que necesites',
  'Recordatorios por WhatsApp',
]

const faqs = [
  {
    q: '¿Mis invitados tienen que descargar algo?',
    a: 'Nada. Abren su invitación desde el mensaje que les mandas, en cualquier celular. Tan fácil que hasta las abuelitas la pueden ver.',
  },
  {
    q: '¿Puedo armarla antes de pagar?',
    a: 'Claro. Diseña tu invitación, súbele tus fotos y revísala las veces que quieras sin pagar nada. Cuando quieras agregar a tus invitados y enviarla, eliges tu paquete.',
  },
  {
    q: '¿Y si al final invito a más personas?',
    a: 'Pasa siempre. Cambias a un paquete más grande cuando lo necesites y solo pagas la diferencia.',
  },
  {
    q: '¿Cómo es la entrada el día del evento?',
    a: 'Desde tu panel les das acceso a tus hostess. Con su celular escanean el pase de cada invitado y ven su nombre y su mesa al instante. Si alguien olvidó su teléfono, lo buscan por nombre.',
  },
  {
    q: '¿Puedo pagar en efectivo?',
    a: 'Sí, en cualquier OXXO, o con tarjeta de crédito o débito. Tu evento queda listo en cuanto se refleja tu pago.',
  },
]

const SIGN_UP = '/login?modo=registro'

export default function HomePage() {
  const plans = useQuery({ queryKey: ['plans'], queryFn: getPlans, placeholderData: FALLBACK_PLANS })
  const planList = plans.data?.length ? plans.data : FALLBACK_PLANS
  const popular = planList[Math.floor((planList.length - 1) / 2)]?.code
  const maxPlanPasses = Math.max(...planList.map((p) => p.maxPasses))
  const designsRow = useRef<HTMLDivElement>(null)
  const designShown = useSnapIndex(designsRow)

  useEffect(() => {
    document.title = 'Vitela · Invitaciones digitales con QR'
  }, [])

  return (
    <div className="home">
      <SiteHeader />

      <main>
        <section className="hero band-bg" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">
              Tu fiesta,
              <br />
              <span>carta por carta.</span>
            </h1>
            <p className="hero-lead">
              Vitela es la invitación digital para bodas y XV años que no se queda en invitar: cada familia confirma
              con un toque, recibe su pase de entrada y llega directo a su mesa. Todo con un solo pago.
            </p>
            <div className="hero-actions">
              <Link to={SIGN_UP} className="button button-ticket big">
                Diseña gratis tu invitación
              </Link>
              <a href="#disenos" className="hero-link">
                Mira los diseños
              </a>
            </div>
            <p className="hero-fine">Tus invitados no descargan nada · Sin mensualidades</p>
          </div>
          <HeroDeck />
        </section>

        <section id="incluye" className="band band-surface" aria-labelledby="tabla-title">
          <div className="band-inner">
            <div className="band-head">
              <h2 id="tabla-title" className="band-title">
                Todo lo que te quita pendientes
              </h2>
              <p>Seis cartas más que vienen en todos los paquetes. Ninguna se paga aparte.</p>
            </div>
            <Tabla />
          </div>
        </section>

        <section id="disenos" className="band band-bg" aria-labelledby="disenos-title">
          <div className="band-inner">
            <div className="band-head">
              <h2 id="disenos-title" className="band-title">
                {catalog.length} diseños, con tus colores
              </h2>
              <p>Cada uno se adapta a tu estilo. Así los verán tus invitados en su celular:</p>
            </div>
            <div>
              <div className="showcase" ref={designsRow}>
                {featured.map((d, i) => (
                  <DesignCard key={d.id} design={d} number={11 + i} eager />
                ))}
              </div>
              <Dots count={featured.length} index={designShown} target={designsRow} label="Diseños" />
            </div>
            <Link to="/disenos" className="button secondary big all-designs">
              Ver los {catalog.length} diseños
            </Link>
          </div>
        </section>

        <section id="precios" className="band band-surface" aria-labelledby="precios-title">
          <div className="band-inner">
            <div className="band-head">
              <h2 id="precios-title" className="band-title">
                Un solo pago por tu evento
              </h2>
              <p>Elige según cuántos invitados tendrás. Si tu lista crece, cambias de paquete pagando solo la diferencia.</p>
            </div>
            <div className="pricing">
              {planList.map((p, i) => {
                const featured = p.code === popular
                const number = 15 + i
                return (
                  <article key={p.code} className={`plan paper-card${featured ? ' plan-featured' : ''}`} style={tilt(number)}>
                    <div className="plan-face">
                      <span className="card-box">{number}</span>
                      <p className="plan-passes">
                        <span className="plan-upto">Hasta</span>
                        <span className="plan-number">{p.maxPasses}</span>
                        <span>invitados</span>
                      </p>
                      <p className="plan-price">
                        {formatMxn(p.priceMxn)} <span>MXN</span>
                      </p>
                      <ul className="plan-list">
                        {included.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                      <Link to={SIGN_UP} className="button plan-button">
                        Comenzar con {p.name}
                      </Link>
                    </div>
                    <h3 className="card-caption">
                      {p.name}
                      {featured && <span> · la favorita</span>}
                    </h3>
                  </article>
                )
              })}
            </div>
            <div className="plan-custom paper-card" style={tilt(18)}>
              <span className="card-box">18</span>
              <div className="plan-custom-body">
                <h3>¿Más de {maxPlanPasses} invitados?</h3>
                <p>Escríbenos con la fecha y cuántos invitados tendrás, y armamos un paquete a la medida de tu fiesta.</p>
              </div>
              <a
                className="button plan-button"
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Paquete para más de ${maxPlanPasses} invitados`)}`}
              >
                Pedir cotización
              </a>
            </div>
          </div>
        </section>

        <section id="preguntas" className="band band-bg band-faq" aria-labelledby="faq-title">
          <div className="band-inner faq-layout">
            <h2 id="faq-title" className="band-title">
              Lo que seguro te estás preguntando
            </h2>
            <div className="faq">
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="finale invert-scheme" aria-labelledby="finale-title">
          <div className="finale-tabla" aria-hidden>
            {deck.map((c) => (
              <div key={c.number} className="finale-card">
                <LoteriaCard number={c.number} name={c.name} ground={c.ground}>
                  {c.art}
                </LoteriaCard>
                <Frijol />
              </div>
            ))}
          </div>
          <h2 id="finale-title">¡Lotería!</h2>
          <p>Así se siente cuando toda tu lista ya confirmó. Arma tu invitación hoy, sin costo, y envíala cuando todo esté perfecto.</p>
          <Link to={SIGN_UP} className="button button-ticket big">
            Diseña gratis tu invitación
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
