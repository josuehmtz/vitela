import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, type CSSProperties } from 'react'
import { useParams } from 'react-router'
import { ApiError } from '../api/client'
import { getPublicInvitation } from '../api/public'
import InvitationView from '../templates/InvitationView'
import { getTemplate, resolveConfig } from '../templates/registry'
import RsvpPanel from '../templates/RsvpPanel'

/** Invitación pública que abre cada invitado desde su link (y después desde el QR). */
export default function InvitationPage() {
  const { token = '' } = useParams()
  const queryClient = useQueryClient()
  const invitation = useQuery({
    queryKey: ['public-invitation', token],
    queryFn: () => getPublicInvitation(token),
    retry: (count, err) => !(err instanceof ApiError && err.status === 404) && count < 2,
  })

  const title = invitation.data?.event.title
  useEffect(() => {
    if (title) document.title = title
  }, [title])

  if (invitation.isPending) return <main className="page narrow center">Cargando invitación…</main>
  if (invitation.isError) {
    const notFound = invitation.error instanceof ApiError && invitation.error.status === 404
    return (
      <main className="page narrow center">
        <h1>{notFound ? 'Invitación no encontrada' : 'No pudimos cargar la invitación'}</h1>
        <p className="muted">
          {notFound
            ? 'Revisa que el link esté completo o pide uno nuevo a quien te invitó.'
            : 'Intenta de nuevo en unos momentos.'}
        </p>
      </main>
    )
  }

  const { event, ...guest } = invitation.data
  const key = getTemplate(event.templateKey).key
  const config = resolveConfig(key, event, event.templateConfig)

  return (
    <div
      className="public-invitation"
      // Colores de la invitación también en el fondo que la rodea (tarjeta en pantallas grandes).
      style={{ '--tpl-bg': config.colors.background, '--tpl-primary': config.colors.primary } as CSSProperties}
    >
      {guest.isPreview && (
        <div className="preview-banner">Vista previa · Esta invitación aún no está publicada</div>
      )}
      <InvitationView
        templateKey={key}
        config={config}
        event={event}
        guest={guest}
        photoBaseUrl={event.photoBaseUrl}
        rsvpAnswered={guest.rsvpStatus !== 'Pending'}
        rsvpSlot={
          <RsvpPanel
            token={token}
            invitation={invitation.data}
            // El color del texto suele ser oscuro: da buen contraste para que el QR se lea bien.
            qrColor={config.colors.text}
            onUpdated={(inv) => queryClient.setQueryData(['public-invitation', token], inv)}
          />
        }
      />
    </div>
  )
}
