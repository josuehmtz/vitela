import { Mark } from '../components/brand/Logo'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { getEvent } from '../api/events'
import { getInvitations, rsvpLabels } from '../api/invitations'
import { getSeating, type SeatGuest } from '../api/seating'

const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'full', timeStyle: 'short' })
const collator = new Intl.Collator('es-MX', { sensitivity: 'base' })

/**
 * Lista impresa para la puerta: el plan B de toda la vida si fallan los celulares o la señal.
 * Ordenada por nombre, con pases, confirmación, mesa y una casilla para palomear la llegada.
 */
export default function GuestListPrintPage() {
  const { id = '' } = useParams()
  const event = useQuery({ queryKey: ['event', id], queryFn: () => getEvent(id) })
  const invitations = useQuery({ queryKey: ['invitations', id], queryFn: () => getInvitations(id) })
  const seating = useQuery({ queryKey: ['seating', id], queryFn: () => getSeating(id) })
  const [onlyConfirmed, setOnlyConfirmed] = useState(false)

  const error = event.error ?? invitations.error ?? seating.error
  if (error)
    return (
      <main className="page">
        <p className="error">{error.message}</p>
        <Link to={`/app/events/${id}`}>Volver al evento</Link>
      </main>
    )
  if (!event.data || !invitations.data || !seating.data) return <main className="page">Cargando…</main>

  const tableNumber = new Map(seating.data.tables.map((t) => [t.id, t.number]))
  const guestsByInvitation = new Map<string, SeatGuest[]>()
  for (const g of seating.data.guests) guestsByInvitation.set(g.invitationId, [...(guestsByInvitation.get(g.invitationId) ?? []), g])

  const rows = invitations.data
    .filter((i) => !onlyConfirmed || i.rsvpStatus === 'Confirmed')
    .map((inv) => {
      const guests = guestsByInvitation.get(inv.id) ?? []
      const tables = [...new Set(guests.map((g) => (g.tableId ? tableNumber.get(g.tableId) : undefined)))]
        .filter((n): n is number => n !== undefined)
        .sort((a, b) => a - b)
      return { inv, guests, tables }
    })
    .sort((a, b) => collator.compare(a.inv.displayName, b.inv.displayName))

  const totalPasses = rows.reduce((s, r) => s + r.inv.passes, 0)
  const confirmedPasses = rows.reduce((s, r) => s + (r.inv.rsvpStatus === 'Confirmed' ? r.inv.confirmedPasses : 0), 0)

  return (
    <main className="page wide print-page">
      <div className="page-header no-print">
        <div>
          <Link to={`/app/events/${id}`} className="back">
            ← {event.data.title}
          </Link>
          <h1>Lista para la puerta</h1>
          <p className="muted small">Imprímela o guárdala como PDF por si falla la señal o algún celular el día del evento.</p>
        </div>
        <div className="actions">
          <label className="toggle">
            <input type="checkbox" checked={onlyConfirmed} onChange={(e) => setOnlyConfirmed(e.target.checked)} />
            Solo confirmados
          </label>
          <button onClick={() => window.print()}>Imprimir</button>
        </div>
      </div>

      <header className="print-heading">
        <Mark mono size={44} className="print-logo" />
        <h2>{event.data.title}</h2>
        <p>
          {dateFmt.format(new Date(event.data.startsAt))}
          {event.data.venueName ? ` · ${event.data.venueName}` : ''}
        </p>
        <p className="small">
          {rows.length} invitaciones · {totalPasses} pases · {confirmedPasses} confirmados
          {onlyConfirmed ? ' · solo confirmados' : ''}
        </p>
      </header>

      <div className="table-wrap">
        <table className="print-table">
          <thead>
            <tr>
              <th className="col-check" aria-label="Llegó">Llegó</th>
              <th>Invitación</th>
              <th className="num">Pases</th>
              <th>Confirmación</th>
              <th>Mesa</th>
              <th>Personas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ inv, guests, tables }) => (
              <tr key={inv.id}>
                <td className="col-check"><span className="checkbox-box" aria-hidden /></td>
                <td className="strong">{inv.displayName}</td>
                <td className="num">{inv.passes}</td>
                <td>
                  {inv.rsvpStatus === 'Confirmed' ? `Sí, ${inv.confirmedPasses}` : rsvpLabels[inv.rsvpStatus]}
                </td>
                <td>{tables.length ? tables.join(', ') : '—'}</td>
                <td className="small">
                  {guests.length
                    ? guests.map((g) => `${g.name}${g.tableId && tables.length > 1 ? ` (${tableNumber.get(g.tableId)})` : ''}`).join(', ')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
