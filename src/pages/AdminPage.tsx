import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { eventStatusLabels } from '../api/events'
import {
  agreementStatusLabels,
  createVenue,
  createVenueInvite,
  deleteVenue,
  formatDateOnly,
  getAccount,
  getVenueEvents,
  getVenues,
  partnerLabels,
  joinUrl,
  reactivateVenue,
  removeVenueMember,
  searchAdminEvents,
  setCustomLimit,
  terminateVenue,
  updateVenue,
  type AdminEvent,
  type CreatedLink,
  type PartnerKind,
  type SaveVenue,
  type Venue,
} from '../api/venues'
import { formatDateTime } from '../lib/dates'
import { plural } from '../lib/text'
import { useConfirm } from '../lib/confirm'

/** Panel de Vitela: salones con convenio, su personal y los eventos que han dado de alta. */
export default function AdminPage() {
  const account = useQuery({ queryKey: ['account'], queryFn: getAccount })
  const venues = useQuery({ queryKey: ['admin-venues'], queryFn: getVenues, enabled: account.data?.isAdmin === true })
  const [creating, setCreating] = useState(false)

  if (account.isPending) return <main className="page">Cargando…</main>
  if (!account.data?.isAdmin) return <Navigate to="/app" replace />

  return (
    <main className="page">
      <Link to="/app" className="back">
        ← Mis eventos
      </Link>
      <div className="page-header">
        <div>
          <p className="eyebrow">Administración</p>
          <h1>Convenios</h1>
        </div>
        {!creating && <button onClick={() => setCreating(true)}>+ Nuevo convenio</button>}
      </div>

      {creating && (
        <section className="card">
          <h2>Nuevo convenio</h2>
          <VenueForm onDone={() => setCreating(false)} />
        </section>
      )}

      {venues.isPending && <p>Cargando…</p>}
      {venues.isError && <p className="error">{venues.error.message}</p>}
      {venues.data?.length === 0 && !creating && (
        <p className="muted">Aún no hay convenios. Da de alta el primero (un salón o un organizador de eventos) con las fechas de su convenio.</p>
      )}
      {venues.data?.map((v) => (
        <VenueCard key={v.id} venue={v} />
      ))}

      <CustomLimitCard />
    </main>
  )
}

function VenueCard({ venue }: { venue: Venue }) {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const [editing, setEditing] = useState(false)
  const [showEvents, setShowEvents] = useState(false)
  const [invite, setInvite] = useState<CreatedLink | null>(null)
  const [copied, setCopied] = useState(false)
  const [terminating, setTerminating] = useState(false)
  const [reason, setReason] = useState('')
  const p = partnerLabels[venue.kind]

  const events = useQuery({
    queryKey: ['admin-venue-events', venue.id],
    queryFn: () => getVenueEvents(venue.id),
    enabled: showEvents,
  })

  const createInvite = useMutation({
    mutationFn: () => createVenueInvite(venue.id),
    onSuccess: (link) => {
      setInvite(link)
      setCopied(false)
    },
  })

  const removeMember = useMutation({
    mutationFn: (userId: string) => removeVenueMember(venue.id, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-venues'] }),
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-venues'] })
  const terminate = useMutation({
    mutationFn: () => terminateVenue(venue.id, reason.trim() || null),
    onSuccess: () => {
      setTerminating(false)
      setReason('')
      refresh()
    },
  })
  const reactivate = useMutation({ mutationFn: () => reactivateVenue(venue.id), onSuccess: refresh })
  const remove = useMutation({ mutationFn: () => deleteVenue(venue.id), onSuccess: refresh })
  const actionError = terminate.error ?? reactivate.error ?? remove.error

  if (editing)
    return (
      <section className="card">
        <h2>Editar {venue.name}</h2>
        <VenueForm venue={venue} onDone={() => setEditing(false)} />
      </section>
    )

  const inviteMessage = invite
    ? `Hola, este es tu acceso a Vitela como ${venue.kind === 'Planner' ? 'parte del equipo' : 'personal'} de ${venue.name}. Ábrelo, inicia sesión o crea tu cuenta y acepta: ${joinUrl(invite.token)}`
    : ''

  return (
    <section className="card">
      <div className="page-header">
        <div>
          <h2>{venue.name}</h2>
          <p className="muted small">
            {p.title} · {agreementPeriod(venue.agreementStartsOn, venue.agreementEndsOn)}
            {venue.contactName && ` · ${venue.contactName}`}
            {venue.phone && ` · ${venue.phone}`}
          </p>
          {venue.terminatedAt && (
            <p className="muted small">
              Terminado antes de tiempo el {formatDateTime(venue.terminatedAt)}
              {venue.terminationReason && ` · ${venue.terminationReason}`}
            </p>
          )}
          {venue.notes && <p className="muted small">{venue.notes}</p>}
        </div>
        <span className={`badge${venue.status === 'Active' ? ' rsvp-confirmed' : ''}`}>
          {agreementStatusLabels[venue.status]}
        </span>
      </div>

      <div>
        <h3 className="small-heading">
          {venue.kind === 'Planner' ? 'Equipo' : 'Personal'} ({venue.members.length})
        </h3>
        {venue.members.length === 0 ? (
          <p className="muted small">Nadie del {p.noun} se ha unido todavía. Genera un link de acceso y envíaselo.</p>
        ) : (
          <ul className="staff-list">
            {venue.members.map((m) => (
              <li key={m.userId} className="page-header">
                <span>{m.email}</span>
                <button
                  className="secondary small"
                  disabled={removeMember.isPending}
                  onClick={async () => {
                    if (
                      await confirm({
                        title: `¿Quitar a ${m.email}?`,
                        message: `Dejará de ver y editar los eventos de ${venue.name}. Los eventos no se borran.`,
                        confirmLabel: 'Quitar',
                        danger: true,
                      })
                    )
                      removeMember.mutate(m.userId)
                  }}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {invite && (
        <div className="pin-box">
          <span className="small">
            Link para una persona del {p.noun} (un solo uso, vence el {formatDateTime(invite.expiresAt)}):
          </span>
          <code className="staff-link">{joinUrl(invite.token)}</code>
          <div className="actions">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(inviteMessage)
                setCopied(true)
              }}
            >
              {copied ? '¡Copiado!' : 'Copiar mensaje'}
            </button>
            <a
              className="button secondary"
              href={`https://wa.me/?text=${encodeURIComponent(inviteMessage)}`}
              target="_blank"
              rel="noreferrer"
            >
              Enviar por WhatsApp
            </a>
          </div>
        </div>
      )}

      <div className="actions">
        <button onClick={() => createInvite.mutate()} disabled={createInvite.isPending}>
          {createInvite.isPending ? 'Generando…' : 'Generar link de acceso'}
        </button>
        <button className="secondary" onClick={() => setShowEvents((s) => !s)}>
          {showEvents ? 'Ocultar eventos' : `Ver eventos (${venue.eventCount})`}
        </button>
        <button className="secondary" onClick={() => setEditing(true)}>
          Editar
        </button>
        {venue.status === 'Terminated' ? (
          <button className="secondary" onClick={() => reactivate.mutate()} disabled={reactivate.isPending}>
            {reactivate.isPending ? 'Reactivando…' : 'Reactivar convenio'}
          </button>
        ) : (
          !terminating && (
            <button className="danger" onClick={() => setTerminating(true)}>
              Terminar convenio
            </button>
          )
        )}
        {venue.eventCount === 0 && (
          <button
            className="danger"
            disabled={remove.isPending}
            onClick={async () => {
              if (
                await confirm({
                  title: `¿Eliminar ${venue.name}?`,
                  message: `Se borran el ${p.noun}, su ${p.team} y sus links de acceso. No se puede deshacer.`,
                  confirmLabel: `Eliminar ${p.noun}`,
                  danger: true,
                })
              )
                remove.mutate()
            }}
          >
            Eliminar {p.noun}
          </button>
        )}
      </div>
      {venue.eventCount > 0 && venue.status !== 'Terminated' && (
        <p className="muted small">
          Un {p.noun} con eventos no se puede eliminar (se conserva su historial). Si el convenio se acaba, termínalo.
        </p>
      )}

      {terminating && (
        <form
          className="pin-box form"
          onSubmit={(e) => {
            e.preventDefault()
            terminate.mutate()
          }}
        >
          <strong>Terminar el convenio de {venue.name}</strong>
          <span className="small">
            A partir de ahora el {p.noun} ya no podrá dar de alta eventos ni cambiar paquetes por convenio. Los eventos que
            ya creó siguen funcionando y su {p.team} los conserva. Puedes reactivarlo después.
          </span>
          <label>
            Motivo (opcional)
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              placeholder={`El ${p.noun} canceló el convenio`}
            />
          </label>
          <div className="actions">
            <button type="submit" className="danger-solid" disabled={terminate.isPending}>
              {terminate.isPending ? 'Terminando…' : 'Terminar convenio'}
            </button>
            <button type="button" className="secondary" onClick={() => setTerminating(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}
      {actionError && <p className="error">{actionError.message}</p>}
      {createInvite.error && <p className="error">{createInvite.error.message}</p>}
      {removeMember.error && <p className="error">{removeMember.error.message}</p>}

      {showEvents && (
        <div className="table-wrap">
          {events.isPending && <p className="muted">Cargando…</p>}
          {events.data?.length === 0 && <p className="muted small">El {p.noun} no ha dado de alta eventos.</p>}
          {events.data && events.data.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Fecha</th>
                  <th>Paquete</th>
                  <th>Alta</th>
                  <th>Cliente</th>
                </tr>
              </thead>
              <tbody>
                {events.data.map((e) => (
                  <tr key={e.id}>
                    <td>{e.title}</td>
                    <td>{formatDateTime(e.startsAt)}</td>
                    <td>
                      {e.planName ?? '—'} <span className="muted small">({eventStatusLabels[e.status]})</span>
                    </td>
                    <td>{formatDateTime(e.createdAt)}</td>
                    <td>{e.hasClient ? 'Vinculado' : 'Pendiente'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {events.data && events.data.length > 0 && (
            <p className="muted small">{plural(events.data.length, 'evento', 'eventos')} dados de alta por el {p.noun}.</p>
          )}
        </div>
      )}
    </section>
  )
}

/** Fecha local (no UTC: de noche en México, toISOString ya da el día siguiente). */
const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const today = () => isoDate(new Date())

/** "Del 19 nov 2026 al 18 nov 2027" o "Desde el 19 nov 2026, por tiempo indefinido". */
const agreementPeriod = (startsOn: string, endsOn: string | null) =>
  endsOn
    ? `Convenio del ${formatDateOnly(startsOn)} al ${formatDateOnly(endsOn)}`
    : `Convenio desde el ${formatDateOnly(startsOn)}, por tiempo indefinido`

type Duration = '6' | '12' | '24' | 'indefinite' | 'custom'

const durationLabels: Record<Duration, string> = {
  '6': '6 meses',
  '12': '1 año',
  '24': '2 años',
  indefinite: 'Tiempo indefinido',
  custom: 'Hasta una fecha específica',
}

/** Último día de un convenio de N meses que empieza en `start` ("2026-11-19" + 12 → "2027-11-18"). */
const endAfterMonths = (start: string, months: number) => {
  const [y, m, d] = start.split('-').map(Number)
  const end = new Date(y, m - 1 + months, d)
  end.setDate(end.getDate() - 1)
  return isoDate(end)
}

function VenueForm({ venue, onDone }: { venue?: Venue; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [kind, setKind] = useState<PartnerKind>(venue?.kind ?? 'Venue')
  const [name, setName] = useState(venue?.name ?? '')
  const [contactName, setContactName] = useState(venue?.contactName ?? '')
  const [phone, setPhone] = useState(venue?.phone ?? '')
  const [notes, setNotes] = useState(venue?.notes ?? '')
  const [startsOn, setStartsOn] = useState(venue?.agreementStartsOn ?? today())
  // Nuevo: 1 año por default. Al editar se muestra la fecha que ya tiene (o indefinido).
  const [duration, setDuration] = useState<Duration>(!venue ? '12' : venue.agreementEndsOn ? 'custom' : 'indefinite')
  const [customEnd, setCustomEnd] = useState(venue?.agreementEndsOn ?? '')

  const endsOn =
    duration === 'indefinite'
      ? null
      : duration === 'custom'
        ? customEnd || null
        : startsOn
          ? endAfterMonths(startsOn, Number(duration))
          : null

  const save = useMutation({
    mutationFn: (data: SaveVenue) => (venue ? updateVenue(venue.id, data) : createVenue(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] })
      onDone()
    },
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    save.mutate({
      kind,
      name,
      contactName: contactName || null,
      phone: phone || null,
      notes: notes || null,
      agreementStartsOn: startsOn,
      agreementEndsOn: endsOn,
    })
  }

  return (
    <form onSubmit={submit} className="form grid-2">
      <label className="span-2">
        Tipo de convenio
        <select value={kind} onChange={(e) => setKind(e.target.value as PartnerKind)}>
          <option value="Venue">Salón de eventos</option>
          <option value="Planner">Organizador de eventos (wedding planner)</option>
        </select>
      </label>
      <label className="span-2">
        {kind === 'Planner' ? 'Nombre del organizador' : 'Nombre del salón'}
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={200} />
      </label>
      <label>
        Contacto
        <input value={contactName} onChange={(e) => setContactName(e.target.value)} maxLength={200} />
      </label>
      <label>
        Teléfono
        <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
      </label>
      <label>
        Inicio del convenio
        <input type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} required />
      </label>
      <label>
        Duración
        <select value={duration} onChange={(e) => setDuration(e.target.value as Duration)}>
          {Object.entries(durationLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {duration === 'custom' ? (
        <label className="span-2">
          Último día del convenio
          <input type="date" value={customEnd} min={startsOn} onChange={(e) => setCustomEnd(e.target.value)} required />
        </label>
      ) : (
        <p className="muted small span-2">
          {endsOn
            ? `El convenio termina el ${formatDateOnly(endsOn)} (último día en que el ${partnerLabels[kind].noun} puede dar de alta eventos).`
            : 'Sin fecha de término: sigue vigente hasta que lo termines desde aquí.'}
        </p>
      )}
      <label className="span-2">
        Notas (paquetes incluidos, forma de pago acordada…)
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} rows={3} />
      </label>
      {save.error && <p className="error span-2">{save.error.message}</p>}
      <div className="actions span-2">
        <button type="submit" disabled={save.isPending}>
          {save.isPending ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" className="secondary" onClick={onDone}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

/**
 * Paquete a la medida: el cliente pidió cotización para más invitados que el paquete más grande,
 * pagó fuera de la app y aquí se le da a su evento el límite acordado.
 */
function CustomLimitCard() {
  const [term, setTerm] = useState('')
  const [search, setSearch] = useState('')
  const events = useQuery({
    queryKey: ['admin-events', search],
    queryFn: () => searchAdminEvents(search),
    enabled: search.length >= 3,
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSearch(term.trim())
  }

  return (
    <section className="card">
      <div>
        <h2>Paquete a la medida</h2>
        <p className="muted small">
          Para quien pidió cotización por más invitados que el paquete más grande. Busca al cliente por su correo y,
          cuando haya pagado, dale a su evento el límite acordado.
        </p>
      </div>
      <form className="actions" onSubmit={submit} role="search">
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Correo del cliente"
          aria-label="Correo del cliente"
          style={{ flex: '1 1 240px' }}
        />
        <button type="submit" disabled={term.trim().length < 3}>
          Buscar
        </button>
      </form>
      {events.isFetching && <p className="muted small">Buscando…</p>}
      {events.isError && <p className="error">{events.error.message}</p>}
      {events.data?.length === 0 && <p className="muted small">Ese correo no tiene eventos.</p>}
      {events.data?.map((ev) => (
        <CustomLimitRow key={ev.id} event={ev} search={search} />
      ))}
    </section>
  )
}

function CustomLimitRow({ event, search }: { event: AdminEvent; search: string }) {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const [editing, setEditing] = useState(false)
  const [maxPasses, setMaxPasses] = useState(() => Math.max(event.maxPasses, event.totalPasses, 600))
  const [note, setNote] = useState(event.customLimitNote ?? '')
  const save = useMutation({
    mutationFn: () => setCustomLimit(event.id, maxPasses, note.trim()),
    onSuccess: () => {
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: ['admin-events', search] })
    },
  })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const ok = await confirm({
      title: `¿Dar ${maxPasses} invitados a “${event.title}”?`,
      message:
        event.status === 'Draft'
          ? 'El evento quedará pagado y desbloqueado. Hazlo solo cuando el cliente ya haya pagado.'
          : 'El límite del evento cambiará al que acordaron.',
      confirmLabel: 'Sí, aplicar',
    })
    if (ok) save.mutate()
  }

  const packageLabel = event.customLimitNote
    ? `A la medida · hasta ${event.maxPasses}`
    : event.planName
      ? `${event.planName} · hasta ${event.maxPasses}`
      : 'Sin paquete'

  return (
    <div className="card" style={{ boxShadow: 'none' }}>
      <div className="page-header">
        <div>
          <strong>{event.title}</strong>
          <p className="muted small" style={{ margin: 0 }}>
            {formatDateTime(event.startsAt)} · {eventStatusLabels[event.status]} · {event.ownerEmail}
            {event.venueName && <> · Convenio con {event.venueName}</>}
          </p>
          <p className="small" style={{ margin: '4px 0 0' }}>
            {packageLabel} · {plural(event.totalPasses, 'invitado registrado', 'invitados registrados')}
          </p>
          {event.customLimitNote && <p className="muted small" style={{ margin: '2px 0 0' }}>{event.customLimitNote}</p>}
        </div>
        {!editing && (
          <button type="button" className="secondary small" onClick={() => setEditing(true)}>
            {event.customLimitNote ? 'Cambiar límite' : 'Dar límite a la medida'}
          </button>
        )}
      </div>
      {editing && (
        <form className="form" onSubmit={submit}>
          <div className="grid-2 form-grid" style={{ display: 'grid', gap: 12 }}>
            <label>
              Invitados (límite)
              <input
                type="number"
                inputMode="numeric"
                min={Math.max(1, event.totalPasses)}
                max={10000}
                required
                value={maxPasses}
                onChange={(e) => setMaxPasses(Number(e.target.value))}
              />
            </label>
            <label>
              Lo que acordaron
              <input
                required
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="800 invitados · $3,500 por transferencia"
              />
            </label>
          </div>
          {save.error && <p className="error">{save.error.message}</p>}
          <div className="actions">
            <button type="submit" disabled={save.isPending}>
              {save.isPending ? 'Guardando…' : 'Aplicar límite'}
            </button>
            <button type="button" className="secondary" onClick={() => setEditing(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
