/**
 * Logos oficiales de Vitela (archivos en public/brand):
 * - vitela-logo-dark.svg: la carta de lotería con la V dorada y el sello; es la marca junto al nombre.
 * - vitela-logo-mono.svg: la misma carta en una sola tinta, para imprimir.
 * - vitela-sello.svg / vitela-sello-mono.svg: el sello solo, para espacios cuadrados (favicon, estados vacíos).
 */
const LOGO = '/brand/vitela-logo-dark.svg'
const LOGO_MONO = '/brand/vitela-logo-mono.svg'
const SEAL = '/brand/vitela-sello.svg'
const SEAL_MONO = '/brand/vitela-sello-mono.svg'

/** La carta de Vitela. `size` es la altura en px; la carta mide 400 × 520. */
export function Mark({ size = 34, mono = false, className }: { size?: number; mono?: boolean; className?: string }) {
  return (
    <img
      src={mono ? LOGO_MONO : LOGO}
      width={Math.round((size * 400) / 520)}
      height={size}
      alt=""
      className={`vitela-mark${className ? ` ${className}` : ''}`}
      decoding="async"
    />
  )
}

/** El sello de Vitela (cuadrado). */
export function Seal({ size = 72, mono = false, className }: { size?: number; mono?: boolean; className?: string }) {
  return (
    <img
      src={mono ? SEAL_MONO : SEAL}
      width={size}
      height={size}
      alt=""
      className={`vitela-seal${className ? ` ${className}` : ''}`}
      decoding="async"
    />
  )
}

/** Logo completo: la carta + "Vitela". */
export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <span className="logo">
      <Mark size={size} />
      <span className="logo-word">Vitela</span>
    </span>
  )
}
