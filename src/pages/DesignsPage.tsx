import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { EventType } from '../api/events'
import DesignCard from '../components/DesignCard'
import SiteFooter from '../components/layout/SiteFooter'
import SiteHeader from '../components/layout/SiteHeader'
import { catalog, designsFor, eventFilters, structureOrder } from '../templates/catalog'
import { getTemplate } from '../templates/registry'
import './home.css'

/** Catálogo público de diseños: todas las estructuras con sus variantes, con filtro por tipo de evento. */
export default function DesignsPage() {
  const [filter, setFilter] = useState<EventType | 'all'>('all')
  useEffect(() => {
    document.title = 'Diseños de invitación · Vitela'
  }, [])

  const groups = useMemo(() => {
    const list = designsFor(filter)
    return structureOrder
      .map((key) => ({ structure: getTemplate(key), designs: list.filter((d) => d.structure === key) }))
      .filter((g) => g.designs.length > 0)
  }, [filter])

  // Número de carta fijo por diseño (su lugar en el catálogo), aunque se filtre.
  const numberOf = (id: string) => catalog.findIndex((d) => d.id === id) + 1

  return (
    <div className="home">
      <SiteHeader />
      <main>
        <section className="band band-bg" aria-labelledby="designs-title">
          <div className="band-inner">
            <div className="band-head">
              <h1 id="designs-title" className="band-title">
                {catalog.length} diseños para tu invitación
              </h1>
              <p>
                Todos vienen en todos los paquetes. Elige uno y cámbiale colores, letra, textos y fotos cuando la estés
                armando.
              </p>
            </div>
            <div className="design-filters" role="group" aria-label="Filtrar por tipo de evento">
              {eventFilters.map((f) => (
                <button key={f.value} type="button" className="chip" aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}>
                  {f.label}
                </button>
              ))}
            </div>
            {groups.map(({ structure, designs }) => (
              <section key={structure.key} className="design-group" aria-labelledby={`g-${structure.key}`}>
                <div className="design-group-head">
                  <h2 id={`g-${structure.key}`}>{structure.name}</h2>
                  <p>{structure.description}</p>
                </div>
                <div className="design-grid">
                  {designs.map((d) => (
                    <DesignCard key={`${d.id}-${filter}`} design={d} number={numberOf(d.id)} eventType={filter === 'all' ? undefined : filter} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
        <section className="finale invert-scheme" aria-labelledby="designs-cta">
          <h2 id="designs-cta">¡Lotería!</h2>
          <p>Elige tu favorito y arma tu invitación hoy, sin costo. La envías cuando todo esté perfecto.</p>
          <Link to="/login?modo=registro" className="button button-ticket big">
            Diseña gratis tu invitación
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
