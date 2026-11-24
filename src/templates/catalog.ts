import type { EventType } from '../api/events'
import type { HeadingFont, TemplateConfig, TemplateKey } from './types'

/**
 * Catálogo de diseños: cada uno es una estructura (plantilla) con su paleta y su letra.
 * Las variantes no necesitan nada en la API: se guardan como colores y letra en la configuración,
 * más `variant` para saber de cuál se partió. Las estructuras nuevas sí van en Domain/Templates.cs.
 */
export interface CatalogDesign {
  id: string
  structure: TemplateKey
  /** Nombre de la variante; se muestra como "Estructura · Variante". */
  name: string
  tagline: string
  colors: TemplateConfig['colors']
  headingFont: HeadingFont
  /** Para qué eventos se sugiere (los filtros del catálogo). */
  events: EventType[]
}

const ALL: EventType[] = ['Wedding', 'Quinceanera', 'Other']
const BODA: EventType[] = ['Wedding', 'Other']
const XV: EventType[] = ['Quinceanera', 'Other']

const d = (
  id: string,
  structure: TemplateKey,
  name: string,
  tagline: string,
  [primary, background, text]: [string, string, string],
  headingFont: HeadingFont,
  events: EventType[] = ALL,
): CatalogDesign => ({ id, structure, name, tagline, colors: { primary, background, text }, headingFont, events })

export const catalog: CatalogDesign[] = [
  // Lotería
  d('loteria-carmin', 'loteria', 'Carmín', 'Cartas de lotería sobre papel marfil', ['#a3262a', '#f5efe4', '#1a1614'], 'serif'),
  d('loteria-azul', 'loteria', 'Azul tinta', 'Lotería de gala en azul profundo', ['#1f3a6b', '#f5efe4', '#1a1614'], 'bodoni', BODA),
  d('loteria-botella', 'loteria', 'Verde botella', 'Cartas en verde de colección', ['#2f5d46', '#f5efe4', '#1a1614'], 'serif'),
  d('loteria-mostaza', 'loteria', 'Mostaza', 'Cálida y alegre, para fiesta grande', ['#8a5f0c', '#f7f0e1', '#1a1614'], 'bodoni'),
  d('loteria-rosa', 'loteria', 'Rosa mexicano', 'La lotería más festiva para tus XV', ['#b0306a', '#fbf1f4', '#2a1620'], 'script', XV),

  // Papel picado
  d('papel-fiesta', 'papel', 'Fiesta', 'Banderitas fucsia y mucha alegría', ['#c2185b', '#fff8f0', '#2b1d1a'], 'script'),
  d('papel-cempasuchil', 'papel', 'Cempasúchil', 'Naranja intenso, muy mexicano', ['#c24d00', '#fff9f2', '#2e1d12'], 'serif'),
  d('papel-turquesa', 'papel', 'Turquesa', 'Fresca, para boda de día o en playa', ['#00727d', '#f4fbfb', '#183236'], 'script', BODA),
  d('papel-morado', 'papel', 'Morado', 'Banderitas violeta para tus XV', ['#6a1b9a', '#fbf6fd', '#2a1733'], 'script', XV),
  d('papel-verde', 'papel', 'Verde limón', 'Campestre y colorida', ['#2e7d32', '#f7fbf5', '#1b2e1c'], 'serif'),

  // Talavera
  d('talavera-cobalto', 'talavera', 'Cobalto', 'Azulejo poblano clásico', ['#1d3f8f', '#fbfaf6', '#1c2233'], 'serif', BODA),
  d('talavera-amarilla', 'talavera', 'Puebla', 'Azulejo en ocre y miel', ['#8f5d00', '#fffbf2', '#2a2214'], 'serif'),
  d('talavera-verde', 'talavera', 'Verde azulejo', 'Talavera verde de patio de hacienda', ['#1f6b4f', '#f7fbf8', '#162b23'], 'serif', BODA),
  d('talavera-cielo', 'talavera', 'Cielo', 'Azul claro y letra manuscrita', ['#2a6aa6', '#f6f9fd', '#182638'], 'script', XV),
  d('talavera-rosa', 'talavera', 'Rosa', 'Azulejo en rosa viejo', ['#a33a5f', '#fdf7f8', '#2e1a22'], 'serif', XV),

  // Art déco
  d('deco-oro', 'deco', 'Oro', 'Noche de gala en negro y dorado', ['#d4af6a', '#14161c', '#f1ead9'], 'bodoni'),
  d('deco-esmeralda', 'deco', 'Esmeralda', 'Verde profundo con detalles dorados', ['#d9b871', '#0f2a24', '#efe8d6'], 'bodoni', BODA),
  d('deco-zafiro', 'deco', 'Zafiro', 'Azul noche y champagne', ['#e0c48a', '#111a33', '#eef0f6'], 'bodoni'),
  d('deco-borgona', 'deco', 'Borgoña', 'Vino y oro, muy elegante', ['#e2b97a', '#2a0f17', '#f3e7e2'], 'bodoni', BODA),
  d('deco-perla', 'deco', 'Perla', 'Art déco claro, en perla y bronce', ['#80601f', '#f4f1ea', '#1c1c1c'], 'bodoni'),

  // Clásica
  d('clasica-dorado', 'clasica', 'Dorado', 'Marco fino y detalles dorados, la de siempre', ['#9b6b43', '#fbf8f3', '#3d3530'], 'serif', BODA),
  d('clasica-hacienda', 'clasica', 'Hacienda', 'Terracota y crema de casa grande', ['#8a4b2a', '#f7efe4', '#3a2a22'], 'serif', BODA),
  d('clasica-etiqueta', 'clasica', 'Etiqueta', 'Blanco y negro, de rigurosa etiqueta', ['#1f1f1f', '#fbf9f4', '#1f1f1f'], 'bodoni', BODA),
  d('clasica-salvia', 'clasica', 'Salvia', 'Verde suave para boda de jardín', ['#566e4e', '#f6f7f2', '#2f3a2c'], 'serif', BODA),
  d('clasica-vino', 'clasica', 'Vino', 'Clásica en tinto, con letra manuscrita', ['#7a1f35', '#fbf6f4', '#3a2228'], 'script'),

  // Jardín
  d('jardin-rosa', 'jardin', 'Rosa', 'Romántica y delicada, soñada para tus XV', ['#b0607a', '#fdf6f7', '#4a3a40'], 'script', XV),
  d('jardin-lavanda', 'jardin', 'Lavanda', 'Flores lila y letra manuscrita', ['#7a5aa6', '#f8f5fc', '#3d3350'], 'script', XV),
  d('jardin-durazno', 'jardin', 'Durazno', 'Cálida, de tarde en el jardín', ['#b55a40', '#fff6f0', '#4a3530'], 'script'),
  d('jardin-menta', 'jardin', 'Menta', 'Fresca, para boda al aire libre', ['#367a66', '#f3faf7', '#24423a'], 'serif', BODA),
  d('jardin-celeste', 'jardin', 'Celeste', 'Azul cielo, para XV o bautizo', ['#3f70a8', '#f4f8fd', '#2a3a50'], 'script', XV),

  // Moderna
  d('moderna-grafito', 'moderna', 'Grafito', 'Limpia y directa, para parejas sin rodeos', ['#1f2937', '#ffffff', '#111827'], 'sans', BODA),
  d('moderna-terracota', 'moderna', 'Terracota', 'Minimalista con un toque cálido', ['#a8472a', '#fbf7f3', '#2a201c'], 'sans'),
  d('moderna-noche', 'moderna', 'Noche', 'Fondo oscuro y letras doradas', ['#e8c27a', '#15181f', '#f2efe8'], 'sans'),
  d('moderna-oliva', 'moderna', 'Oliva', 'Verde oliva, sobria y actual', ['#556b2f', '#f7f7f1', '#1f2416'], 'sans', BODA),
  d('moderna-azul', 'moderna', 'Azul rey', 'Moderna con títulos de gala', ['#1f4fa3', '#ffffff', '#13203a'], 'bodoni'),
]

export const structureOrder: TemplateKey[] = ['loteria', 'papel', 'talavera', 'deco', 'clasica', 'jardin', 'moderna']

export const findDesign = (id: string | undefined) => catalog.find((x) => x.id === id)

export const designsFor = (filter: EventType | 'all') =>
  filter === 'all' ? catalog : catalog.filter((x) => x.events.includes(filter))

/** Filtros del catálogo, con el nombre que ven los anfitriones. */
export const eventFilters: { value: EventType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'Wedding', label: 'Bodas' },
  { value: 'Quinceanera', label: 'XV años' },
  { value: 'Other', label: 'Otras fiestas' },
]
