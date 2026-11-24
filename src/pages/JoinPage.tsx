import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { acceptAccessLink, getAccessLink } from '../api/venues'
import { Seal } from '../components/brand/Logo'

/** Link que comparte un salón (cliente de un evento) o Vitela (personal de un salón) para vincular la cuenta. */
export default function JoinPage() {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const info = useQuery({ queryKey: ['access-link', token], queryFn: () => getAccessLink(token), retry: false })

  const accept = useMutation({
    mutationFn: () => acceptAccessLink(token),
    onSuccess: (r) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['account'] })
      navigate(r.eventId ? `/app/events/${r.eventId}` : '/app', { replace: true })
    },
  })

  return (
    <main className="page">
      <section className="card empty-state">
        <Seal size={72} />
        {info.isPending && <p>Cargando…</p>}
        {info.isError && (
          <>
            <h1>Link no válido</h1>
            <p className="muted">Revisa que lo hayas copiado completo o pide uno nuevo.</p>
          </>
        )}
        {info.data && (
          <>
            <h1>{info.data.kind === 'EventOwner' ? info.data.name : `Únete a ${info.data.name}`}</h1>
            <p className="muted">
              {info.data.kind === 'EventOwner'
                ? 'Tu salón te dio acceso a tu evento. Al aceptar, quedará ligado a esta cuenta para que diseñes tu invitación, cargues a tus invitados y acomodes las mesas.'
                : 'Te invitaron a formar parte del personal del salón: podrás dar de alta eventos por convenio y administrarlos.'}
            </p>
            {info.data.problem ? (
              <p className="notice notice-error">{info.data.problem}</p>
            ) : (
              <button className="big" onClick={() => accept.mutate()} disabled={accept.isPending}>
                {accept.isPending ? 'Vinculando…' : 'Aceptar'}
              </button>
            )}
            {accept.error && <p className="error">{accept.error.message}</p>}
          </>
        )}
        <Link to="/app" className="back">
          Ir a mis eventos
        </Link>
      </section>
    </main>
  )
}
