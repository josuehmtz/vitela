import { useId, type CSSProperties, type ReactNode } from 'react'
import { tiltFor } from './tilt'

/**
 * Cartas de lotería de Vitela, como papelería de lujo: papel marfil con filo negro fino, marco interior
 * en dorado champagne con brillo de foil, dibujo en tinta plana, número y nombre.
 * Todo es SVG dibujado a mano. Los colores no van escritos aquí: cada atributo nombra una tinta
 * (fill="rojo", stroke="tinta") y index.css la resuelve con las variables --card-* (iguales en ambos modos).
 */

const INK = {
  tinta: 'tinta',
  carton: 'papel',
  rojo: 'rojo',
  azul: 'azul',
  oro: 'mostaza',
  verde: 'verde',
} as const

export type Tinta = keyof typeof INK

const line = { stroke: INK.tinta, strokeWidth: 2.2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

interface CardProps {
  number: number
  name: string
  /** Color de fondo del dibujo. */
  ground: Tinta
  children: ReactNode
  className?: string
  /** Texto alternativo: la carta es una imagen con nombre. */
  label?: string
}


/** Degradado del foil champagne (solo para el marco). */
function Foil({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" className="foil-stop-light" />
      <stop offset="0.45" className="foil-stop" />
      <stop offset="0.7" className="foil-stop-light" />
      <stop offset="1" className="foil-stop-deep" />
    </linearGradient>
  )
}

/** Una carta de lotería completa (100 × 150). El dibujo va en un área de 84 × 92 escalada al panel. */
export function LoteriaCard({ number, name, ground, children, className, label }: CardProps) {
  const foil = `foil-${useId().replace(/:/g, '')}`
  return (
    <svg
      viewBox="0 0 100 150"
      className={`loteria${className ? ` ${className}` : ''}`}
      style={{ '--tilt': `${tiltFor(number)}deg` } as CSSProperties}
      role="img"
      aria-label={label ?? `${name}, carta ${number}`}
    >
      <defs>
        <Foil id={foil} />
      </defs>
      {/* Papel marfil con filo negro fino; en modo oscuro, un filo dorado tenue lo despega del fondo */}
      <rect x="0.6" y="0.6" width="98.8" height="148.8" rx="4.6" fill="none" stroke="halo" strokeWidth="1.2" />
      <rect x="1.4" y="1.4" width="97.2" height="147.2" rx="4" fill={INK.carton} stroke={INK.tinta} strokeWidth="1.1" />
      {/* Marco interior de foil champagne */}
      <rect x="4.6" y="4.6" width="90.8" height="140.8" rx="1.6" fill="none" stroke={`url(#${foil})`} strokeWidth="2" />
      <rect x="9" y="9" width="82" height="110" fill={INK[ground]} stroke={INK.tinta} strokeWidth="1.1" className="loteria-ground" />
      <g transform="translate(9.6 25.6) scale(0.962)" className="loteria-art">
        {children}
      </g>
      <rect x="9" y="9" width="19" height="14.5" fill={INK.carton} stroke={INK.tinta} strokeWidth="1.1" />
      <text x="18.5" y="20" textAnchor="middle" className="loteria-number" fill={INK.tinta}>
        {number}
      </text>
      <rect x="9" y="123.5" width="82" height="17.5" fill={INK.carton} stroke={INK.tinta} strokeWidth="1.1" />
      <text
        x="50"
        y="135.8"
        textAnchor="middle"
        className="loteria-name"
        fill={INK.tinta}
        // Mayúsculas como en las cartas impresas; los nombres largos bajan de tamaño, sin deformar la letra.
        style={{ fontSize: `${Math.max(8, Math.min(10, 76 / (name.length * 0.8))).toFixed(2)}px` }}
      >
        {name}
      </text>
    </svg>
  )
}

/* ---------------------------------------------------------------------------
   Dibujos (coordenadas locales 0–84 × 0–92)
   --------------------------------------------------------------------------- */

export function ArtInvitacion() {
  return (
    <g>
      {/* Destellos */}
      <path d="M10 22 L16 26 M8 40 L15 40 M74 22 L68 26 M76 40 L69 40" {...line} stroke={INK.carton} />
      {/* Celular */}
      <rect x="22" y="6" width="40" height="78" rx="7" fill={INK.tinta} />
      <rect x="25.5" y="13" width="33" height="62" rx="2" fill={INK.carton} />
      <rect x="37" y="8.5" width="10" height="2" rx="1" fill={INK.carton} opacity="0.5" />
      {/* Mensaje con su nombre */}
      <rect x="29" y="19" width="26" height="25" rx="4" fill={INK.oro} {...line} strokeWidth="1.6" />
      <path d="M42 37.5 C 35 32, 33.5 28.5, 36 26.2 C 38 24.4, 40.6 25.2, 42 27.4 C 43.4 25.2, 46 24.4, 48 26.2 C 50.5 28.5, 49 32, 42 37.5 Z" fill={INK.rojo} {...line} strokeWidth="1.4" />
      <path d="M30 50 H54 M30 56 H48 M30 62 H51" {...line} strokeWidth="2" opacity="0.55" />
      <rect x="29" y="66" width="26" height="6" rx="3" fill={INK.rojo} />
    </g>
  )
}

export function ArtPalomita() {
  return (
    <g>
      {/* La palomita: paloma en vuelo y también la marca de "sí" */}
      <path d="M8 14 L15 22 L29 6" fill="none" stroke={INK.oro} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Cola en abanico */}
      <path d="M26 58 L6 48 L11 58 L3 64 L13 65 L8 74 L28 64 Z" fill={INK.carton} {...line} />
      <path d="M11 58 L26 60 M13 65 L26 62" {...line} strokeWidth="1.2" fill="none" />
      {/* Cuerpo */}
      <path d="M26 64 C 22 56, 30 48, 42 46 C 50 45, 56 40, 58 34 L 70 38 C 70 50, 62 62, 48 66 C 40 68, 32 68, 26 64 Z" fill={INK.carton} {...line} />
      {/* Cabeza, ojo y pico */}
      <circle cx="64" cy="32" r="8.5" fill={INK.carton} {...line} />
      <circle cx="66.5" cy="30" r="1.9" fill={INK.tinta} />
      <path d="M72 30 L82 33.5 L72 36.5 Z" fill={INK.oro} {...line} strokeWidth="1.5" />
      {/* Ala levantada con plumas */}
      <path d="M36 50 C 30 36, 34 20, 46 8 C 48 18, 56 24, 62 26 C 58 36, 50 46, 36 50 Z" fill={INK.carton} {...line} />
      <path d="M40 44 C 40 34, 43 24, 47 16 M45 44 C 47 36, 51 30, 56 26" {...line} strokeWidth="1.2" fill="none" />
      {/* Ramita de olivo en el pico */}
      <path d="M80 35 C 82 42, 80 48, 76 54" fill="none" {...line} strokeWidth="1.6" />
      <ellipse cx="82" cy="43" rx="4" ry="2" fill={INK.verde} {...line} strokeWidth="1.2" transform="rotate(70 82 43)" />
      <ellipse cx="76" cy="49" rx="4" ry="2" fill={INK.verde} {...line} strokeWidth="1.2" transform="rotate(-30 76 49)" />
      {/* Patas */}
      <path d="M44 67 L42 74 M50 66 L50 73" {...line} strokeWidth="1.8" />
    </g>
  )
}

/** Patrón de QR fijo (no es un código real; es el dibujo de la carta). */
const QR_SIZE = 21
const QR_CELLS: [number, number][] = (() => {
  const cells: [number, number][] = []
  let seed = 7
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > QR_SIZE - 9 && y < 8) || (x < 8 && y > QR_SIZE - 9)
  for (let y = 0; y < QR_SIZE; y++)
    for (let x = 0; x < QR_SIZE; x++) if (!inFinder(x, y) && rand() > 0.52) cells.push([x, y])
  return cells
})()

export function ArtPase() {
  const s = 2.8
  const ox = 12.6
  const oy = 16
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={ox + x * s} y={oy + y * s} width={7 * s} height={7 * s} fill={INK.tinta} />
      <rect x={ox + (x + 1) * s} y={oy + (y + 1) * s} width={5 * s} height={5 * s} fill={INK.carton} />
      <rect x={ox + (x + 2) * s} y={oy + (y + 2) * s} width={3 * s} height={3 * s} fill={INK.tinta} />
    </g>
  )
  return (
    <g>
      <rect x="8" y="11.5" width="68" height="68" rx="4" fill={INK.carton} {...line} />
      {QR_CELLS.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={ox + x * s} y={oy + y * s} width={s + 0.05} height={s + 0.05} fill={INK.tinta} />
      ))}
      {finder(0, 0)}
      {finder(QR_SIZE - 7, 0)}
      {finder(0, QR_SIZE - 7)}
      {/* Perforación de boleto */}
      <path d="M8 86 H76" stroke={INK.tinta} strokeWidth="2" strokeDasharray="3 3" />
    </g>
  )
}

export function ArtMesa() {
  const chairs = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2)
  return (
    <g>
      {chairs.map((a) => (
        <circle key={a} cx={42 + Math.cos(a) * 33} cy={46 + Math.sin(a) * 33} r="6.5" fill={INK.oro} {...line} />
      ))}
      <circle cx="42" cy="46" r="25" fill={INK.carton} {...line} />
      <circle cx="42" cy="46" r="19.5" fill="none" stroke={INK.tinta} strokeWidth="1" strokeDasharray="2 2.5" />
      <text x="42" y="57" textAnchor="middle" className="loteria-figure" fill={INK.rojo}>
        7
      </text>
    </g>
  )
}

export function ArtCampana() {
  return (
    <g>
      <path d="M8 30 C 4 38, 4 48, 8 56 M16 34 C 13 40, 13 46, 16 52 M76 30 C 80 38, 80 48, 76 56 M68 34 C 71 40, 71 46, 68 52" fill="none" {...line} stroke={INK.carton} />
      <path d="M42 8 V14" {...line} strokeWidth="3" />
      <circle cx="42" cy="8" r="3.5" fill={INK.oro} {...line} />
      <path d="M42 14 C 28 14, 24 26, 24 40 C 24 54, 20 60, 14 66 H70 C 64 60, 60 54, 60 40 C 60 26, 56 14, 42 14 Z" fill={INK.oro} {...line} />
      <path d="M31 24 C 29 32, 29 42, 30 52" fill="none" stroke={INK.carton} strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
      <rect x="12" y="65" width="60" height="6" rx="3" fill={INK.oro} {...line} />
      <circle cx="42" cy="77" r="5.5" fill={INK.tinta} />
    </g>
  )
}

export function ArtMano() {
  return (
    <g>
      {/* Mano abierta que recibe */}
      <path
        d="M24 84 V52 C 24 48, 18 40, 14 34 C 11 30, 15 26, 19 29 L 28 40 V16 C 28 12, 34 12, 34 16 V38 V10 C 34 6, 40 6, 40 10 V38 V12 C 40 8, 46 8, 46 12 V40 V18 C 46 14, 52 14, 52 18 V54 C 52 70, 46 76, 46 84 Z"
        fill={INK.carton}
        {...line}
      />
      <path d="M34 38 V30 M40 38 V28 M46 40 V32" {...line} strokeWidth="1.4" />
      {/* Pase que llega a la mano */}
      <rect x="54" y="20" width="22" height="22" rx="2.5" fill={INK.carton} {...line} transform="rotate(12 65 31)" />
      <g transform="rotate(12 65 31)">
        <rect x="57" y="23" width="6" height="6" fill={INK.tinta} />
        <rect x="67" y="23" width="6" height="6" fill={INK.tinta} />
        <rect x="57" y="33" width="6" height="6" fill={INK.tinta} />
        <rect x="68" y="34" width="3" height="3" fill={INK.tinta} />
      </g>
    </g>
  )
}

export function ArtEscalera() {
  return (
    <g transform="rotate(-8 42 46)">
      <path d="M24 88 L34 4 M60 88 L50 4" {...line} strokeWidth="4" stroke={INK.tinta} />
      <path d="M24 88 L34 4 M60 88 L50 4" stroke={INK.oro} strokeWidth="1.8" strokeLinecap="round" />
      {[78, 64, 50, 36, 22].map((y, i) => {
        const t = (88 - y) / 84
        const x1 = 24 + 10 * t
        const x2 = 60 - 10 * t
        return <path key={y} d={`M${x1} ${y} H${x2}`} {...line} strokeWidth="3.5" stroke={i === 4 ? INK.rojo : INK.tinta} />
      })}
    </g>
  )
}

export function ArtRosa() {
  return (
    <g>
      <path d="M42 50 C 40 62, 44 74, 40 90" fill="none" {...line} strokeWidth="3" stroke={INK.verde} />
      <path d="M42 50 C 40 62, 44 74, 40 90" fill="none" {...line} strokeWidth="1" />
      <path d="M41 70 C 30 64, 22 66, 18 72 C 26 76, 34 76, 41 70 Z" fill={INK.verde} {...line} strokeWidth="1.6" />
      <path d="M42 80 C 52 72, 60 74, 64 80 C 56 84, 48 84, 42 80 Z" fill={INK.verde} {...line} strokeWidth="1.6" />
      <path d="M42 52 C 24 52, 20 36, 24 24 C 30 30, 34 30, 42 22 C 50 30, 54 30, 60 24 C 64 36, 60 52, 42 52 Z" fill={INK.rojo} {...line} />
      <path d="M42 22 C 34 14, 28 18, 30 26 M42 22 C 50 14, 56 18, 54 26" fill={INK.rojo} {...line} />
      <path d="M34 36 C 36 44, 48 44, 50 36 C 46 40, 38 40, 34 36 Z M38 30 C 40 34, 44 34, 46 30" fill="none" {...line} strokeWidth="1.5" />
    </g>
  )
}

export function ArtSalon() {
  const tables: [number, number][] = [[18, 22], [42, 18], [66, 22], [18, 50], [66, 50], [30, 74], [54, 74]]
  return (
    <g>
      <rect x="4" y="6" width="76" height="80" fill={INK.carton} {...line} />
      {/* Pista */}
      <g>
        {[0, 1, 2, 3].map((i) =>
          [0, 1, 2, 3].map((j) => (
            <rect key={`${i}${j}`} x={34 + i * 4} y={40 + j * 4} width="4" height="4" fill={(i + j) % 2 ? INK.tinta : INK.oro} />
          )),
        )}
        <rect x="34" y="40" width="16" height="16" fill="none" {...line} strokeWidth="1.4" />
      </g>
      {tables.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="6.5" fill={i === 1 ? INK.rojo : INK.carton} {...line} strokeWidth="1.8" />
      ))}
      <path d="M36 86 V80 H48 V86" fill="none" {...line} strokeWidth="1.6" />
    </g>
  )
}

export function ArtPeso() {
  return (
    <g>
      <path d="M12 14 L16 20 M72 14 L68 20 M10 76 L16 72 M74 76 L68 72" {...line} stroke={INK.carton} />
      <circle cx="42" cy="46" r="31" fill={INK.oro} {...line} />
      <circle cx="42" cy="46" r="25" fill="none" {...line} strokeWidth="1.2" />
      <text x="42" y="60" textAnchor="middle" className="loteria-figure" fill={INK.tinta}>
        $
      </text>
    </g>
  )
}

/** Frijolito que marca una carta ya "cantada". */
export function Frijol({ className }: { className?: string }) {
  return (
    <svg className={`frijol${className ? ` ${className}` : ''}`} viewBox="0 0 40 26" aria-hidden>
      <ellipse cx="20" cy="13" rx="17" ry="10.5" fill="frijol" stroke="tinta" strokeWidth="1.6" />
      <path d="M9 12 C 14 8, 24 8, 31 12" fill="none" stroke="frijol-brillo" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}
