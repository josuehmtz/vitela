import { createContext, useContext } from 'react'

export interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Acción destructiva (eliminar, quitar): el botón se pinta en rojo. */
  danger?: boolean
}

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

export const ConfirmContext = createContext<ConfirmFn | null>(null)

/** Reemplazo de window.confirm con el diseño de Vitela: `if (await confirm({...})) ...` */
export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext)
  if (!confirm) throw new Error('useConfirm requiere <ConfirmProvider>.')
  return confirm
}
