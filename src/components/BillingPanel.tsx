import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  formatMxn,
  getBilling,
  orderStatusLabels,
  setAgreementPlan,
  startCheckout,
  syncCheckout,
  type Billing,
} from '../api/billing'
import { formatDateTime } from '../lib/dates'
import { useConfirm } from '../lib/confirm'

/** Paquete del evento: comprar (publica el evento) o mejorar pagando la diferencia. */
export default function BillingPanel({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const [params, setParams] = useSearchParams()
  // Al regresar de Stripe la URL trae ?pago=exito&session_id=... o ?pago=cancelado
  const [returned] = useState(() => ({ result: params.get('pago'), sessionId: params.get('session_id') }))
  const [notice, setNotice] = useState<{ kind: 'ok' | 'info' | 'error'; text: string } | null>(() =>
    returned.result === 'cancelado' ? { kind: 'info', text: 'Cancelaste el pago. No se hizo ningún cargo.' } : null,
  )
  const billing = useQuery({ queryKey: ['billing', eventId], queryFn: () => getBilling(eventId) })

  const refreshEvent = () => {
    queryClient.invalidateQueries({ queryKey: ['event', eventId] })
    queryClient.invalidateQueries({ queryKey: ['events'] })
  }

  const checkout = useMutation({
    mutationFn: (planCode: string) => startCheckout(eventId, planCode),
    // Stripe Checkout es una página de Stripe: ahí se captura la tarjeta (nunca pasa por nuestro servidor).
    onSuccess: ({ url }) => window.location.assign(url),
  })

  // Personal del salón: cambia el paquete dentro del convenio, sin pago en línea.
  const agreement = useMutation({
    mutationFn: (planCode: string) => setAgreementPlan(eventId, planCode),
    onSuccess: (b: Billing) => {
      queryClient.setQueryData(['billing', eventId], b)
      refreshEvent()
      setNotice({ kind: 'ok', text: `Paquete actualizado a ${b.currentPlan} por convenio.` })
    },
  })

  const sync = useMutation({
    mutationFn: (sessionId: string) => syncCheckout(eventId, sessionId),
    onSuccess: (b: Billing) => {
      queryClient.setQueryData(['billing', eventId], b)
      refreshEvent()
      const last = b.orders[0]
      setNotice(
        last?.status === 'Paid'
          ? {
              kind: 'ok',
              text: '¡Pago recibido! Tu evento está publicado: tus invitados ya pueden confirmar y recibir su QR.',
            }
          : {
              kind: 'info',
              text: 'Tu pago está pendiente. Si elegiste OXXO, el evento se publicará en cuanto se acredite (puede tardar hasta un día hábil).',
            },
      )
    },
    onError: () =>
      setNotice({ kind: 'error', text: 'No pudimos confirmar el pago. Si se cobró, se reflejará en unos minutos.' }),
  })

  const handled = useRef(false)
  const { mutate: syncMutate } = sync
  useEffect(() => {
    if (!returned.result || handled.current) return
    handled.current = true
    if (returned.result === 'exito' && returned.sessionId) syncMutate(returned.sessionId)
    // Limpia la URL para que recargar la página no repita el aviso.
    setParams(
      (p) => {
        p.delete('pago')
        p.delete('session_id')
        return p
      },
      { replace: true },
    )
  }, [returned, setParams, syncMutate])

  if (billing.isPending) return null
  if (billing.isError) return <p className="error">{billing.error.message}</p>

  const b = billing.data
  const draft = b.eventStatus === 'Draft'
  const pendingOrder = b.orders.find((o) => o.status === 'Pending')
  const upgrades = b.options.filter((o) => o.available)
  const byAgreement = b.agreementVenue !== null

  return (
    <section className="card billing">
      <div className="page-header">
        <div>
          <h2>Paquete y pago</h2>
          {draft ? (
            <p className="muted small">
              Elige tu paquete y completa el pago. En cuanto se acredite se desbloquean la lista de invitados, las mesas
              y el acceso de hostess. El diseño de la invitación ya está disponible.
            </p>
          ) : (
            <p className="muted small">
              Paquete <strong>{b.customLimit ? 'a la medida' : b.currentPlan}</strong> · hasta {b.maxPasses} invitados
              {` (${b.totalPasses} registrados).`}
              {b.managedBy && <> Incluido en el convenio de {b.managedBy}.</>}
            </p>
          )}
        </div>
        {!draft && <span className="badge rsvp-confirmed">Publicado</span>}
      </div>

      {notice && (
        <p className={`notice notice-${notice.kind}`} role="status">
          {notice.text}
        </p>
      )}
      {sync.isPending && <p className="muted">Confirmando tu pago…</p>}
      {checkout.error && <p className="error">{checkout.error.message}</p>}
      {agreement.error && <p className="error">{agreement.error.message}</p>}
      {!b.paymentsEnabled && !byAgreement && (
        <p className="notice notice-info">Por el momento no es posible pagar. Inténtalo de nuevo más tarde.</p>
      )}
      {pendingOrder && !notice && (
        <p className="notice notice-info">
          Tienes un pago pendiente de {formatMxn(pendingOrder.amountMxn)} (paquete {pendingOrder.planName}). Si pagaste
          en OXXO, se reflejará en cuanto se acredite.
        </p>
      )}

      {(draft || upgrades.length > 0) && (
        <>
          {!draft && <h3 className="small-heading">Mejorar paquete</h3>}
          <div className="plan-options">
            {(draft ? b.options : upgrades).map((p) => (
              <div key={p.code} className={`plan-option${p.available ? '' : ' disabled'}`}>
                <strong>{p.name}</strong>
                <span className="muted small">Hasta {p.maxPasses} invitados</span>
                {byAgreement ? (
                  <span className="muted small">Incluido en el convenio</span>
                ) : (
                  <span className="plan-price">
                    {formatMxn(p.amountToPay)}
                    {!draft && <span className="muted small"> (diferencia)</span>}
                  </span>
                )}
                {p.reason && <span className="muted small">{p.reason}</span>}
                {byAgreement ? (
                  <button
                    disabled={!p.available || agreement.isPending}
                    onClick={async () => {
                      if (
                        await confirm({
                          title: `¿Cambiar a paquete ${p.name}?`,
                          message: `Se aplicará por el convenio de ${b.agreementVenue}, sin pago en línea. El evento podrá tener hasta ${p.maxPasses} invitados.`,
                          confirmLabel: 'Cambiar paquete',
                        })
                      )
                        agreement.mutate(p.code)
                    }}
                  >
                    {agreement.isPending && agreement.variables === p.code ? 'Aplicando…' : 'Aplicar por convenio'}
                  </button>
                ) : (
                  <button
                    disabled={!p.available || !b.paymentsEnabled || checkout.isPending}
                    onClick={() => checkout.mutate(p.code)}
                  >
                    {checkout.isPending && checkout.variables === p.code
                      ? 'Abriendo pago…'
                      : draft
                        ? 'Elegir y pagar'
                        : 'Mejorar'}
                  </button>
                )}
              </div>
            ))}
          </div>
          {!byAgreement && (
            <p className="muted small">
              Paga con tarjeta de crédito o débito, o en efectivo en OXXO. Es un solo pago por tu evento.
            </p>
          )}
        </>
      )}

      {b.orders.length > 0 && (
        <details className="orders">
          <summary className="small">Historial de pagos ({b.orders.length})</summary>
          <ul>
            {b.orders.map((o) => (
              <li key={o.id}>
                <span>
                  {o.planName} · {o.source === 'Agreement' ? 'convenio' : formatMxn(o.amountMxn)}
                </span>
                <span className="muted small">
                  {orderStatusLabels[o.status]} · {formatDateTime(o.paidAt ?? o.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
