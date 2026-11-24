import { useEffect, useRef, useState } from 'react'
import { invitationUrl, markSent, unmarkSent, type Invitation } from '../api/invitations'
import { invitationMessage, whatsAppLink } from '../lib/whatsapp'

interface Props {
  eventId: string
  eventTitle: string
  /** Invitaciones con teléfono que todavía no se mandan (se toma una foto al abrir). */
  pending: Invitation[]
  /** Cuántas no tienen teléfono (para avisar al final). */
  withoutPhone: number
  onChanged: () => void
  onClose: () => void
}

/** Si regresa a la página antes de esto, fue un parpadeo al abrir WhatsApp, no un regreso real. */
const MIN_AWAY_MS = 1200

/**
 * Envío rápido por WhatsApp: abre WhatsApp con el mensaje listo para cada invitación, una tras otra.
 * Al regresar a Vitela se anota como enviada y pasa sola a la siguiente (con opción de deshacer).
 */
export default function QuickSendDialog({ eventId, eventTitle, pending, withoutPhone, onChanged, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [queue] = useState(pending)
  const [index, setIndex] = useState(0)
  const [awaiting, setAwaiting] = useState(false)
  const [sent, setSent] = useState(0)
  const [skipped, setSkipped] = useState(0)
  const [last, setLast] = useState<Invitation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const openedAt = useRef(0)

  const current = queue[index] as Invitation | undefined
  const done = !current

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const confirmSent = async () => {
    if (!current) return
    setAwaiting(false)
    setError(null)
    try {
      await markSent(eventId, current.id)
      setLast(current)
      setSent((n) => n + 1)
      setIndex((i) => i + 1)
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar. Intenta de nuevo.')
    }
  }

  // Al volver de WhatsApp (cambio de app en el celular o de pestaña en la compu) se da por enviada.
  useEffect(() => {
    if (!awaiting) return
    const onReturn = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - openedAt.current < MIN_AWAY_MS) return
      void confirmSent()
    }
    document.addEventListener('visibilitychange', onReturn)
    window.addEventListener('focus', onReturn)
    return () => {
      document.removeEventListener('visibilitychange', onReturn)
      window.removeEventListener('focus', onReturn)
    }
  })

  const message = current ? invitationMessage(current.displayName, eventTitle, invitationUrl(current.token)) : ''
  const link = current ? whatsAppLink(current.phone, message) : null

  const openWhatsApp = () => {
    if (!link) return
    setError(null)
    setLast(null)
    const w = window.open(link, '_blank')
    if (!w) {
      setError('Tu navegador bloqueó la ventana de WhatsApp. Permite las ventanas emergentes para este sitio e intenta de nuevo.')
      return
    }
    w.opener = null
    openedAt.current = Date.now()
    setAwaiting(true)
  }

  const skip = () => {
    setAwaiting(false)
    setLast(null)
    setSkipped((n) => n + 1)
    setIndex((i) => i + 1)
  }

  const undoLast = async () => {
    if (!last) return
    try {
      await unmarkSent(eventId, last.id)
      setLast(null)
      setSent((n) => n - 1)
      setIndex((i) => i - 1)
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo deshacer.')
    }
  }

  return (
    <dialog ref={dialogRef} className="confirm-dialog quick-send" onCancel={onClose} aria-labelledby="quick-send-title">
      <div className="confirm-body">
        <div className="quick-send-head">
          <h2 id="quick-send-title">Envío rápido</h2>
          {!done && (
            <span className="muted small">
              {index + 1} de {queue.length}
            </span>
          )}
        </div>
        <div className="quick-send-progress" aria-hidden>
          <div style={{ width: `${queue.length ? (index / queue.length) * 100 : 100}%` }} />
        </div>

        {last && (
          <p className="quick-send-undo small">
            ✓ {last.displayName} quedó como enviada.{' '}
            <button type="button" className="link small" onClick={undoLast}>
              No se envió, deshacer
            </button>
          </p>
        )}

        {current ? (
          <>
            <div className="quick-send-card">
              <strong>{current.displayName}</strong>
              <span className="muted small">
                {current.phone} · {current.passes} {current.passes === 1 ? 'pase' : 'pases'}
              </span>
              <p className="quick-send-message small">{message}</p>
            </div>

            {awaiting ? (
              <div className="quick-send-waiting">
                <p className="small">Toca <strong>Enviar</strong> en WhatsApp y regresa aquí: pasaremos a la siguiente.</p>
                <div className="confirm-actions">
                  <button type="button" className="secondary" onClick={openWhatsApp}>
                    Abrir de nuevo
                  </button>
                  <button type="button" onClick={confirmSent}>
                    Ya lo envié
                  </button>
                </div>
              </div>
            ) : (
              <div className="confirm-actions">
                <button type="button" className="secondary" onClick={skip}>
                  Saltar
                </button>
                <button type="button" onClick={openWhatsApp}>
                  Abrir WhatsApp
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="quick-send-done">
            <p>
              <strong>¡Listo!</strong> {sent} {sent === 1 ? 'invitación enviada' : 'invitaciones enviadas'}
              {skipped > 0 && ` · ${skipped} ${skipped === 1 ? 'saltada' : 'saltadas'} (siguen como pendientes)`}.
            </p>
            {withoutPhone > 0 && (
              <p className="muted small">
                {withoutPhone} {withoutPhone === 1 ? 'invitación no tiene' : 'invitaciones no tienen'} teléfono: agrégalo con
                "Editar" o comparte su link con "Copiar link".
              </p>
            )}
          </div>
        )}

        {error && <p className="error small">{error}</p>}

        <div className="confirm-actions">
          <button type="button" className={done ? '' : 'link'} onClick={onClose}>
            {done ? 'Cerrar' : 'Terminar después'}
          </button>
        </div>
      </div>
    </dialog>
  )
}
