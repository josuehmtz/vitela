import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { createClientLink, joinUrl, type CreatedLink } from '../api/venues'
import { formatDateTime } from '../lib/dates'

interface Props {
  eventId: string
  eventTitle: string
  managedBy: string
  clientEmail: string | null
}

/** El salón comparte con su cliente un link para que entre a su evento con su propia cuenta. */
export default function ClientLinkPanel({ eventId, eventTitle, managedBy, clientEmail }: Props) {
  const [created, setCreated] = useState<CreatedLink | null>(null)
  const [copied, setCopied] = useState(false)
  const create = useMutation({
    mutationFn: () => createClientLink(eventId),
    onSuccess: (link) => {
      setCreated(link)
      setCopied(false)
    },
  })

  if (clientEmail)
    return (
      <section className="card">
        <h2>Cliente</h2>
        <p className="muted small">
          Evento administrado por <strong>{managedBy}</strong>. Cliente vinculado: <strong>{clientEmail}</strong>. Ambos
          pueden editar el evento, las invitaciones, las mesas y las hostess.
        </p>
      </section>
    )

  const url = created ? joinUrl(created.token) : ''
  const message = `¡Hola! Ya puedes entrar a tu evento "${eventTitle}" en Vitela para diseñar tu invitación, cargar a tus invitados y acomodar las mesas: ${url}`

  return (
    <section className="card">
      <div>
        <h2>Cliente</h2>
        <p className="muted small">
          Aún no hay un cliente vinculado. Genera un link y envíaselo: al abrirlo, inicia sesión o crea su cuenta y
          queda como dueño del evento. Tu equipo conserva el acceso completo.
        </p>
      </div>

      {created ? (
        <div className="pin-box">
          <span className="small">
            Link para el cliente (un solo uso, vence el {formatDateTime(created.expiresAt)}):
          </span>
          <code className="staff-link">{url}</code>
          <div className="actions">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(message)
                setCopied(true)
              }}
            >
              {copied ? '¡Copiado!' : 'Copiar mensaje'}
            </button>
            <a
              className="button secondary"
              href={`https://wa.me/?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noreferrer"
            >
              Enviar por WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <div className="actions">
          <button onClick={() => create.mutate()} disabled={create.isPending}>
            {create.isPending ? 'Generando…' : 'Generar link para el cliente'}
          </button>
        </div>
      )}
      {created && <p className="muted small">Si generas otro link, este deja de funcionar.</p>}
      {create.error && <p className="error">{create.error.message}</p>}
    </section>
  )
}
