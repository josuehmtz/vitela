import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { formatMxn, startCheckout } from '../api/billing'
import { getPlans } from '../api/client'
import { createEvent, type SaveEvent } from '../api/events'
import { createVenueEvent, type MyVenue } from '../api/venues'
import EventForm from './EventForm'

interface Props {
  /** Si viene, el evento se da de alta por convenio de este salón (sin pago en línea). */
  venue?: MyVenue
  onCancel: () => void
}

/** Alta de evento: el cliente elige paquete y paga; el salón elige el paquete que vendió. */
export default function NewEventCard({ venue, onCancel }: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const plans = useQuery({ queryKey: ['plans'], queryFn: getPlans, staleTime: Infinity })
  const [planCode, setPlanCode] = useState<string | null>(null)
  const [planError, setPlanError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: async (data: SaveEvent) => {
      if (venue) {
        const ev = await createVenueEvent(venue.id, data, planCode!)
        return { eventId: ev.id, checkoutUrl: null as string | null }
      }
      const ev = await createEvent(data)
      try {
        const { url } = await startCheckout(ev.id, planCode!)
        return { eventId: ev.id, checkoutUrl: url }
      } catch {
        // El evento ya existe con pago pendiente: desde su página se puede reintentar el pago.
        return { eventId: ev.id, checkoutUrl: null }
      }
    },
    onSuccess: ({ eventId, checkoutUrl }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      if (checkoutUrl) window.location.assign(checkoutUrl)
      else navigate(`/app/events/${eventId}`)
    },
  })

  const submit = (data: SaveEvent) => {
    if (!planCode) {
      setPlanError('Elige un paquete.')
      return
    }
    create.mutate(data)
  }

  return (
    <section className="card">
      <div>
        <h2>{venue ? `Nuevo evento · convenio ${venue.name}` : 'Nuevo evento'}</h2>
        <p className="muted small">
          {venue
            ? 'El paquete queda incluido por el convenio. Después podrás enviarle al cliente un link para que entre a su evento.'
            : 'Elige tu paquete según el número de invitados. Puedes diseñar tu invitación desde ya; al completar el pago se desbloquean los invitados, las mesas y el acceso de hostess.'}
        </p>
      </div>

      <fieldset className="plan-picker">
        <legend className="small-heading">Paquete</legend>
        {plans.isError && <p className="error">{plans.error.message}</p>}
        <div className="plan-options">
          {plans.data?.map((p) => (
            <label key={p.code} className={`plan-option selectable${planCode === p.code ? ' selected' : ''}`}>
              <input
                type="radio"
                name="plan"
                value={p.code}
                checked={planCode === p.code}
                onChange={() => {
                  setPlanCode(p.code)
                  setPlanError(null)
                }}
              />
              <strong>{p.name}</strong>
              <span className="muted small">Hasta {p.maxPasses} invitados</span>
              {!venue && <span className="plan-price">{formatMxn(p.priceMxn)}</span>}
            </label>
          ))}
        </div>
        {planError && <p className="error">{planError}</p>}
      </fieldset>

      <EventForm
        submitLabel={venue ? 'Crear evento' : 'Continuar al pago'}
        pending={create.isPending}
        error={create.error?.message}
        onSubmit={submit}
        onCancel={onCancel}
      />
      {!venue && (
        <p className="muted small">
          Paga con tarjeta de crédito o débito, o en efectivo en OXXO. Es un solo pago por tu evento.
        </p>
      )}
    </section>
  )
}
