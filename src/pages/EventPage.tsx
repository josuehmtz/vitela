import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { deleteEvent, eventStatusLabels, eventTypeLabels, getEvent, updateEvent, type SaveEvent } from '../api/events'
import BillingPanel from '../components/BillingPanel'
import ClientLinkPanel from '../components/ClientLinkPanel'
import EventForm from '../components/EventForm'
import InvitationsPanel from '../components/InvitationsPanel'
import StaffAccessPanel from '../components/StaffAccessPanel'
import { formatDateTime } from '../lib/dates'
import { plural } from '../lib/text'
import { useConfirm } from '../lib/confirm'

export default function EventPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const [editing, setEditing] = useState(false)

  const event = useQuery({ queryKey: ['event', id], queryFn: () => getEvent(id) })

  const save = useMutation({
    mutationFn: (data: SaveEvent) => updateEvent(id, data),
    onSuccess: (ev) => {
      queryClient.setQueryData(['event', id], ev)
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setEditing(false)
    },
  })

  const remove = useMutation({
    mutationFn: () => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      navigate('/app')
    },
  })

  if (event.isPending) return <main className="page">Cargando…</main>
  if (event.isError)
    return (
      <main className="page">
        <p className="error">{event.error.message}</p>
        <Link to="/app">Volver a mis eventos</Link>
      </main>
    )

  const ev = event.data
  const readOnly = ev.status === 'Archived'
  // Pago pendiente: solo se ven los datos del evento y el pago.
  const locked = ev.status === 'Draft'
  const remaining = Math.max(0, ev.passLimit - ev.totalPasses)
  const usage = ev.passLimit > 0 ? Math.min(100, (ev.totalPasses / ev.passLimit) * 100) : 0

  return (
    <main className="page">
      <Link to="/app" className="back">
        ← Mis eventos
      </Link>

      {editing ? (
        <section className="card">
          <h2>Editar evento</h2>
          <EventForm
            initial={ev}
            submitLabel="Guardar cambios"
            pending={save.isPending}
            error={save.error?.message}
            onSubmit={(data) => save.mutate(data)}
            onCancel={() => setEditing(false)}
          />
        </section>
      ) : (
        <section className="card">
          <div className="page-header">
            <div>
              <h1>{ev.title}</h1>
              <p className="muted">
                {eventTypeLabels[ev.type]} · {formatDateTime(ev.startsAt)}
                {ev.venueName && ` · ${ev.venueName}`}
              </p>
              {ev.rsvpDeadline && (
                <p className="muted">Confirmar asistencia antes del {formatDateTime(ev.rsvpDeadline)}</p>
              )}
            </div>
            <span className="badge">{eventStatusLabels[ev.status]}</span>
          </div>

          {ev.managedBy && (
            <p className="muted small">
              Evento con convenio de <strong>{ev.managedBy}</strong>.
            </p>
          )}

          {locked ? (
            <p className="notice notice-info">
              Ya puedes diseñar tu invitación sin costo. Completa el pago de tu paquete para desbloquear la lista de
              invitados, las mesas y el acceso de hostess.
            </p>
          ) : (
            <div className="meter" aria-label="Invitados registrados">
              <div className="meter-label">
                <span>
                  <strong>{ev.totalPasses}</strong> de {ev.passLimit} invitados
                </span>
                <span className="muted">{plural(ev.invitationCount, 'invitación', 'invitaciones')}</span>
              </div>
              <div className="meter-track">
                <div className={`meter-fill${usage >= 100 ? ' full' : ''}`} style={{ width: `${usage}%` }} />
              </div>
            </div>
          )}

          {!readOnly && (
            <div className="actions">
              <Link to={`/app/events/${ev.id}/design`} className="button">
                Diseñar invitación
              </Link>
              {!locked && (
                <>
                  <Link to={`/app/events/${ev.id}/seating`} className="button">
                    Mesas
                  </Link>
                  <Link to={`/app/events/${ev.id}/lista`} className="button secondary">
                    Lista para imprimir
                  </Link>
                </>
              )}
              <button className="secondary" onClick={() => setEditing(true)}>
                Editar datos
              </button>
              {locked && !ev.managedBy && (
                <button
                  className="danger"
                  disabled={remove.isPending}
                  onClick={async () => {
                    if (
                      await confirm({
                        title: `¿Eliminar "${ev.title}"?`,
                        message: 'Se borrará el evento con todos sus datos. No se puede deshacer.',
                        confirmLabel: 'Eliminar evento',
                        danger: true,
                      })
                    )
                      remove.mutate()
                  }}
                >
                  Eliminar evento
                </button>
              )}
            </div>
          )}
          {remove.error && <p className="error">{remove.error.message}</p>}
        </section>
      )}

      <BillingPanel eventId={ev.id} />

      {ev.isVenueStaff && ev.managedBy && (
        <ClientLinkPanel eventId={ev.id} eventTitle={ev.title} managedBy={ev.managedBy} clientEmail={ev.clientEmail} />
      )}

      {locked ? null : (
        <>
          {ev.invitationCount > 0 && (
            <section className="stats" aria-label="Resumen de confirmaciones">
              <div className="stat">
                <span className="stat-value">{ev.rsvp.confirmedPasses}</span>
                <span className="stat-label">personas confirmadas</span>
                <span className="muted small">{plural(ev.rsvp.confirmed, 'invitación', 'invitaciones')}</span>
              </div>
              <div className="stat">
                <span className="stat-value">{ev.rsvp.pendingPasses}</span>
                <span className="stat-label">personas sin responder</span>
                <span className="muted small">{plural(ev.rsvp.pending, 'invitación', 'invitaciones')}</span>
              </div>
              <div className="stat">
                <span className="stat-value">{ev.rsvp.declined}</span>
                <span className="stat-label">
                  {ev.rsvp.declined === 1 ? 'invitación no asistirá' : 'invitaciones no asistirán'}
                </span>
              </div>
              {ev.rsvp.checkedIn > 0 && (
                <div className="stat">
                  <span className="stat-value">{ev.rsvp.checkedIn}</span>
                  <span className="stat-label">
                    {ev.rsvp.checkedIn === 1 ? 'persona ha llegado' : 'personas han llegado'}
                  </span>
                </div>
              )}
            </section>
          )}

          <InvitationsPanel
            eventId={ev.id}
            eventTitle={ev.title}
            rsvpDeadline={ev.rsvpDeadline}
            remainingPasses={remaining}
            readOnly={readOnly}
          />

          <StaffAccessPanel eventId={ev.id} eventTitle={ev.title} readOnly={readOnly} />
        </>
      )}
    </main>
  )
}
