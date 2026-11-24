import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { eventStatusLabels, eventTypeLabels, getEvents } from '../api/events'
import { formatDateOnly, getAccount, type MyVenue } from '../api/venues'
import NewEventCard from '../components/NewEventCard'
import { formatDateTime } from '../lib/dates'
import { plural } from '../lib/text'
import { Seal } from '../components/brand/Logo'

const monthFmt = new Intl.DateTimeFormat('es-MX', { month: 'short' })

/** null = cerrado; 'client' = compra directa; MyVenue = alta por convenio de ese salón. */
type Creating = null | 'client' | MyVenue

export default function DashboardPage() {
  const [creating, setCreating] = useState<Creating>(null)
  const events = useQuery({ queryKey: ['events'], queryFn: getEvents })
  const account = useQuery({ queryKey: ['account'], queryFn: getAccount })

  const activeVenues = account.data?.venues.filter((v) => v.status === 'Active') ?? []
  const isVenueStaff = (account.data?.venues.length ?? 0) > 0
  const pendingPayment = events.data?.find((e) => e.status === 'Draft' && !e.managedBy)

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Tu panel</p>
          <h1>Mis eventos</h1>
        </div>
        {!creating && (
          <div className="actions">
            {activeVenues.map((v) => (
              <button key={v.id} onClick={() => setCreating(v)}>
                + Evento por convenio{activeVenues.length > 1 ? ` · ${v.name}` : ''}
              </button>
            ))}
            {!isVenueStaff && events.data && events.data.length > 0 && !pendingPayment && (
              <button onClick={() => setCreating('client')}>+ Nuevo evento</button>
            )}
          </div>
        )}
      </div>

      {account.data?.venues
        .filter((v) => v.status !== 'Active')
        .map((v) => (
          <p key={v.id} className="notice notice-info">
            {v.status === 'Upcoming' && (
              <>
                El convenio de <strong>{v.name}</strong> empieza el {formatDateOnly(v.agreementStartsOn)}. A partir de
                ese día podrás dar de alta eventos.
              </>
            )}
            {v.status === 'Expired' && (
              <>
                El convenio de <strong>{v.name}</strong> terminó el {formatDateOnly(v.agreementEndsOn!)}, así que ya no
                puedes dar de alta eventos nuevos. Tus eventos existentes siguen disponibles.
              </>
            )}
            {v.status === 'Terminated' && (
              <>
                El convenio de <strong>{v.name}</strong> fue terminado, así que ya no puedes dar de alta eventos nuevos.
                Tus eventos existentes siguen disponibles.
              </>
            )}
          </p>
        ))}

      {pendingPayment && !creating && (
        <p className="notice notice-info">
          <strong>{pendingPayment.title}</strong> tiene el pago pendiente.{' '}
          Ya puedes <Link to={`/app/events/${pendingPayment.id}/design`}>diseñar tu invitación</Link>;{' '}
          <Link to={`/app/events/${pendingPayment.id}`}>completa tu pago</Link> para cargar a tus invitados.
        </p>
      )}

      {creating && (
        <NewEventCard venue={creating === 'client' ? undefined : creating} onCancel={() => setCreating(null)} />
      )}

      {events.isPending && <p>Cargando…</p>}
      {events.isError && <p className="error">{events.error.message}</p>}
      {events.data?.length === 0 && !creating && !isVenueStaff && (
        <section className="empty-state card">
          <Seal size={72} />
          <h2>Tu primera celebración empieza aquí</h2>
          <p className="muted">
            Elige tu paquete y crea tu evento. En cuanto se acredite tu pago podrás diseñar la invitación, cargar a tus
            invitados y acomodar las mesas.
          </p>
          <button className="big" onClick={() => setCreating('client')}>
            Crear mi primer evento
          </button>
        </section>
      )}
      {events.data?.length === 0 && !creating && isVenueStaff && (
        <section className="empty-state card">
          <Seal size={72} />
          <h2>Aún no hay eventos del salón</h2>
          <p className="muted">Da de alta el primer evento con el paquete que contrató tu cliente.</p>
        </section>
      )}

      <ul className="event-list">
        {events.data?.map((ev) => {
          const d = new Date(ev.startsAt)
          return (
            <li key={ev.id}>
              <Link to={`/app/events/${ev.id}`} className="card event-card">
                <div className="event-date" aria-hidden>
                  <span className="event-date-day">{d.getDate()}</span>
                  <span className="event-date-month">{monthFmt.format(d)}</span>
                </div>
                <div className="event-card-main">
                  <strong className="event-card-title">{ev.title}</strong>
                  <span className="muted small">
                    {eventTypeLabels[ev.type]} · {formatDateTime(ev.startsAt)}
                    {ev.venueName && ` · ${ev.venueName}`}
                  </span>
                  {ev.managedBy && isVenueStaff && !ev.hasClient && (
                    <span className="muted small">Sin cliente vinculado</span>
                  )}
                </div>
                <div className="event-card-stats">
                  <span className={`badge status-${ev.status.toLowerCase()}`}>{eventStatusLabels[ev.status]}</span>
                  <span className="muted small">
                    {plural(ev.invitationCount, 'invitación', 'invitaciones')} ·{' '}
                    {plural(ev.totalPasses, 'invitado', 'invitados')}
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
