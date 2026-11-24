import { api, send } from './client'
import type { EventStatus } from './events'

export type OrderStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded'

export interface PlanOption {
  code: string
  name: string
  maxPasses: number
  priceMxn: number
  amountToPay: number
  available: boolean
  reason: string | null
}

export interface Order {
  id: string
  planName: string
  amountMxn: number
  status: OrderStatus
  source: 'Stripe' | 'Agreement'
  createdAt: string
  paidAt: string | null
}

export interface Billing {
  eventStatus: EventStatus
  currentPlan: string | null
  maxPasses: number
  totalPasses: number
  paymentsEnabled: boolean
  options: PlanOption[]
  orders: Order[]
  /** Salón con convenio que administra el evento. */
  managedBy: string | null
  /** Si quien consulta es personal del salón con convenio vigente: puede cambiar el paquete sin pago en línea. */
  agreementVenue: string | null
  /** El evento tiene un paquete a la medida (lo pone un administrador). */
  customLimit: boolean
}

export const getBilling = (eventId: string) => api<Billing>(`/events/${eventId}/billing`)

/** Crea la sesión de Stripe Checkout; el front redirige a la URL devuelta. */
export const startCheckout = (eventId: string, planCode: string) =>
  send<{ url: string }>('POST', `/events/${eventId}/checkout`, { planCode })

/** El salón aplica un paquete incluido en su convenio. */
export const setAgreementPlan = (eventId: string, planCode: string) =>
  send<Billing>('POST', `/events/${eventId}/agreement-plan`, { planCode })

export const syncCheckout = (eventId: string, sessionId: string) =>
  send<Billing>('POST', `/events/${eventId}/checkout/sync`, { sessionId })

export const orderStatusLabels: Record<OrderStatus, string> = {
  Pending: 'Pendiente',
  Paid: 'Pagado',
  Failed: 'No completado',
  Refunded: 'Reembolsado',
}

const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
const mxnWhole = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
/** $499 para cantidades enteras, $899.50 si hay centavos. */
export const formatMxn = (n: number) => (Number.isInteger(n) ? mxnWhole : mxn).format(n)
