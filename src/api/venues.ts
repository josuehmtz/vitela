import { api, send } from './client'
import type { EventDetail, EventStatus, SaveEvent } from './events'

/** Upcoming: aún no empieza · Expired: pasó su fecha de término · Terminated: se terminó antes de tiempo. */
export type AgreementStatus = 'Upcoming' | 'Active' | 'Expired' | 'Terminated'

export const agreementStatusLabels: Record<AgreementStatus, string> = {
  Upcoming: 'Por iniciar',
  Active: 'Vigente',
  Expired: 'Vencido',
  Terminated: 'Terminado',
}

/** Con quién es el convenio. Las reglas son las mismas; solo cambia cómo se nombra. */
export type PartnerKind = 'Venue' | 'Planner'

export const partnerLabels: Record<PartnerKind, {
  /** "Salón de eventos" / "Organizador de eventos" */
  title: string
  /** "salón" / "organizador" */
  noun: string
  /** "personal" / "equipo" */
  team: string
}> = {
  Venue: { title: 'Salón de eventos', noun: 'salón', team: 'personal' },
  Planner: { title: 'Organizador de eventos', noun: 'organizador', team: 'equipo' },
}

export interface MyVenue {
  id: string
  kind: PartnerKind
  name: string
  agreementStartsOn: string
  /** null = por tiempo indefinido. */
  agreementEndsOn: string | null
  status: AgreementStatus
  terminatedAt: string | null
}

/** Cuenta actual: si es administrador de Vitela y de qué salones forma parte. */
export interface Account {
  email: string
  isAdmin: boolean
  venues: MyVenue[]
}

export const getAccount = () => api<Account>('/me')

/** El salón da de alta un evento con el paquete incluido en su convenio. */
export const createVenueEvent = (venueId: string, event: SaveEvent, planCode: string) =>
  send<EventDetail>('POST', `/venues/${venueId}/events`, { event, planCode })

export interface CreatedLink {
  token: string
  expiresAt: string
}

/** Link para que el cliente del salón vincule su cuenta al evento. */
export const createClientLink = (eventId: string) => send<CreatedLink>('POST', `/events/${eventId}/client-link`)

export const joinUrl = (token: string) => `${window.location.origin}/app/unirse/${token}`

// ---- Links de vinculación ----

export type AccessLinkKind = 'EventOwner' | 'VenueMember'

export interface AccessLinkInfo {
  kind: AccessLinkKind
  name: string
  /** Por qué ya no se puede usar (usado o expirado), o null. */
  problem: string | null
  /** Tipo del salón u organizador detrás del link. */
  partnerKind: PartnerKind | null
}

export const getAccessLink = (token: string) => api<AccessLinkInfo>(`/access-links/${encodeURIComponent(token)}`)

export const acceptAccessLink = (token: string) =>
  send<{ kind: AccessLinkKind; eventId: string | null }>('POST', `/access-links/${encodeURIComponent(token)}/accept`)

// ---- Administración (solo Vitela) ----

export interface VenueMember {
  userId: string
  email: string
  addedAt: string
}

export interface Venue {
  id: string
  kind: PartnerKind
  name: string
  contactName: string | null
  phone: string | null
  notes: string | null
  agreementStartsOn: string
  agreementEndsOn: string | null
  status: AgreementStatus
  terminatedAt: string | null
  terminationReason: string | null
  members: VenueMember[]
  eventCount: number
}

export interface SaveVenue {
  kind: PartnerKind
  name: string
  contactName: string | null
  phone: string | null
  notes: string | null
  agreementStartsOn: string
  /** null = por tiempo indefinido. */
  agreementEndsOn: string | null
}

export interface VenueEvent {
  id: string
  title: string
  startsAt: string
  status: EventStatus
  planName: string | null
  createdAt: string
  hasClient: boolean
}

export const getVenues = () => api<Venue[]>('/admin/venues')
export const createVenue = (v: SaveVenue) => send<Venue>('POST', '/admin/venues', v)
export const updateVenue = (id: string, v: SaveVenue) => send<Venue>('PUT', `/admin/venues/${id}`, v)
export const terminateVenue = (id: string, reason: string | null) =>
  send<Venue>('POST', `/admin/venues/${id}/terminate`, { reason })
export const reactivateVenue = (id: string) => send<Venue>('POST', `/admin/venues/${id}/reactivate`)
export const deleteVenue = (id: string) => send<void>('DELETE', `/admin/venues/${id}`)
export const createVenueInvite = (id: string) => send<CreatedLink>('POST', `/admin/venues/${id}/invite-link`)
export const removeVenueMember = (id: string, userId: string) =>
  send<void>('DELETE', `/admin/venues/${id}/members/${userId}`)
export const getVenueEvents = (id: string) => api<VenueEvent[]>(`/admin/venues/${id}/events`)

/** Evento de un cliente, para darle un paquete a la medida (más invitados que el paquete más grande). */
export interface AdminEvent {
  id: string
  title: string
  startsAt: string
  status: EventStatus
  ownerEmail: string | null
  venueName: string | null
  planName: string | null
  maxPasses: number
  totalPasses: number
  /** Lo acordado y pagado fuera de la app; null si el evento no tiene paquete a la medida. */
  customLimitNote: string | null
}

export const searchAdminEvents = (email: string) =>
  api<AdminEvent[]>(`/admin/events?email=${encodeURIComponent(email)}`)
export const setCustomLimit = (id: string, maxPasses: number, note: string) =>
  send<AdminEvent>('POST', `/admin/events/${id}/custom-limit`, { maxPasses, note })

const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeZone: 'UTC' })
/** "2026-12-31" → "31 dic 2026" (fecha sin hora, no se convierte de zona). */
export const formatDateOnly = (d: string) => dateFmt.format(new Date(`${d}T00:00:00Z`))
