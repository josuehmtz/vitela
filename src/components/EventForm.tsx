import { useState, type FormEvent } from 'react'
import { eventTypeLabels, type EventDetail, type EventType, type SaveEvent } from '../api/events'
import { fromLocalInput, toLocalInput } from '../lib/dates'

interface Props {
  initial?: EventDetail
  submitLabel: string
  pending: boolean
  error?: string
  onSubmit: (data: SaveEvent) => void
  onCancel?: () => void
}

export default function EventForm({ initial, submitLabel, pending, error, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [type, setType] = useState<EventType>(initial?.type ?? 'Wedding')
  const [startsAt, setStartsAt] = useState(toLocalInput(initial?.startsAt))
  const [venueName, setVenueName] = useState(initial?.venueName ?? '')
  const [venueAddress, setVenueAddress] = useState(initial?.venueAddress ?? '')
  const [mapsUrl, setMapsUrl] = useState(initial?.mapsUrl ?? '')
  const [rsvpDeadline, setRsvpDeadline] = useState(toLocalInput(initial?.rsvpDeadline))
  // Ceremonia en otro lugar (iglesia, juzgado, jardín…). Opcional.
  const [hasCeremony, setHasCeremony] = useState(
    Boolean(initial?.ceremonyName || initial?.ceremonyAddress || initial?.ceremonyMapsUrl || initial?.ceremonyStartsAt),
  )
  const [ceremonyName, setCeremonyName] = useState(initial?.ceremonyName ?? '')
  const [ceremonyAddress, setCeremonyAddress] = useState(initial?.ceremonyAddress ?? '')
  const [ceremonyMapsUrl, setCeremonyMapsUrl] = useState(initial?.ceremonyMapsUrl ?? '')
  const [ceremonyStartsAt, setCeremonyStartsAt] = useState(toLocalInput(initial?.ceremonyStartsAt))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      type,
      startsAt: fromLocalInput(startsAt)!,
      venueName: venueName || null,
      venueAddress: venueAddress || null,
      mapsUrl: mapsUrl || null,
      rsvpDeadline: fromLocalInput(rsvpDeadline),
      ceremonyName: hasCeremony ? ceremonyName || null : null,
      ceremonyAddress: hasCeremony ? ceremonyAddress || null : null,
      ceremonyMapsUrl: hasCeremony ? ceremonyMapsUrl || null : null,
      ceremonyStartsAt: hasCeremony ? fromLocalInput(ceremonyStartsAt) : null,
    })
  }

  return (
    <form onSubmit={submit} className="form grid-2">
      <label className="span-2">
        Nombre del evento
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Boda de Ana y Luis" required maxLength={200} />
      </label>
      <label>
        Tipo
        <select value={type} onChange={(e) => setType(e.target.value as EventType)}>
          {Object.entries(eventTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Fecha y hora
        <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
      </label>
      <label>
        {hasCeremony ? 'Lugar de la recepción' : 'Lugar'}
        <input value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="Hacienda Los Arcos" maxLength={200} />
      </label>
      <label>
        Confirmar asistencia antes de
        <input type="datetime-local" value={rsvpDeadline} onChange={(e) => setRsvpDeadline(e.target.value)} />
      </label>
      <label className="span-2">
        Dirección
        <input value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} maxLength={300} />
      </label>
      <label className="span-2">
        Link de Google Maps
        <input type="url" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} placeholder="https://maps.app.goo.gl/..." maxLength={500} />
      </label>
      <label className="toggle span-2">
        <input type="checkbox" checked={hasCeremony} onChange={(e) => setHasCeremony(e.target.checked)} />
        La ceremonia es en otro lugar (iglesia, juzgado…)
      </label>
      {hasCeremony && (
        <fieldset className="span-2 form grid-2 ceremony-fields">
          <legend>Ceremonia</legend>
          <label>
            Lugar de la ceremonia
            <input value={ceremonyName} onChange={(e) => setCeremonyName(e.target.value)} placeholder="Parroquia de San Juan Bautista" maxLength={200} />
          </label>
          <label>
            Hora de la ceremonia
            <input type="datetime-local" value={ceremonyStartsAt} onChange={(e) => setCeremonyStartsAt(e.target.value)} />
          </label>
          <label className="span-2">
            Dirección de la ceremonia
            <input value={ceremonyAddress} onChange={(e) => setCeremonyAddress(e.target.value)} maxLength={300} />
          </label>
          <label className="span-2">
            Link de Google Maps de la ceremonia
            <input type="url" value={ceremonyMapsUrl} onChange={(e) => setCeremonyMapsUrl(e.target.value)} placeholder="https://maps.app.goo.gl/..." maxLength={500} />
          </label>
        </fieldset>
      )}
      {error && <p className="error span-2">{error}</p>}
      <div className="actions span-2">
        <button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
