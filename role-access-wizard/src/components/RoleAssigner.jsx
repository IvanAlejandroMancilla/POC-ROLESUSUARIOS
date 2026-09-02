import { useEffect, useMemo, useState } from 'react'
import { getAvailableRoles } from '../api/mockApi'
import { useWizardState, useWizardActions } from '../context/WizardContext'
import { BASE_ROLE } from '../data/mockData'
import Spinner from './common/Spinner'
import ErrorBanner from './common/ErrorBanner'
import Chip from './common/Chip'

const MODULES = ['Common', 'FSCM', 'HCM']

export default function RoleAssigner() {
  const { selectedRoleIds, roleSources } = useWizardState()
  const { toggleRole, nextStep, prevStep } = useWizardActions()

  const [roles, setRoles] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')

  async function load() {
    setStatus('loading')
    setError(null)
    try {
      const data = await getAvailableRoles()
      setRoles(data)
      setStatus('success')
    } catch (err) {
      setError(err)
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const matchesModule = moduleFilter === 'all' || r.module === moduleFilter
      const matchesSearch =
        !search.trim() ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.code.toLowerCase().includes(search.toLowerCase())
      return matchesModule && matchesSearch
    })
  }, [roles, search, moduleFilter])

  const selectedRoles = roles.filter((r) => selectedRoleIds.includes(r.id))

  return (
    <section className="step-panel">
      <h2>Asignar roles</h2>
      <p className="step-panel__hint">
        El rol base <strong>{BASE_ROLE.name}</strong> se asigna automáticamente. Agrega los roles funcionales adicionales.
      </p>

      {status === 'loading' && <Spinner label="Cargando catálogo de roles…" />}
      {status === 'error' && <ErrorBanner error={error} onRetry={load} />}

      {status === 'success' && (
        <>
          {selectedRoles.length > 0 && (
            <div className="chip-row">
              {selectedRoles.map((r) => (
                <Chip
                  key={r.id}
                  tone={roleSources[r.id] === 'base' ? 'base' : roleSources[r.id] === 'copied' ? 'copied' : 'default'}
                  onRemove={roleSources[r.id] === 'base' ? undefined : () => toggleRole(r.id)}
                >
                  {r.name}
                  {roleSources[r.id] === 'copied' && ' (copiado)'}
                  {roleSources[r.id] === 'base' && ' (base)'}
                </Chip>
              ))}
            </div>
          )}

          <div className="filters-row">
            <input
              type="text"
              className="input"
              placeholder="Buscar rol por nombre o código…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="segmented">
              <button type="button" className={moduleFilter === 'all' ? 'active' : ''} onClick={() => setModuleFilter('all')}>
                Todos
              </button>
              {MODULES.map((m) => (
                <button key={m} type="button" className={moduleFilter === m ? 'active' : ''} onClick={() => setModuleFilter(m)}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <ul className="role-list">
            {filteredRoles.map((role) => {
              const checked = selectedRoleIds.includes(role.id)
              const isBase = role.id === BASE_ROLE.id
              return (
                <li key={role.id} className={`role-list__item ${checked ? 'is-selected' : ''}`}>
                  <label>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={isBase}
                      onChange={() => toggleRole(role.id)}
                    />
                    <div>
                      <p className="role-list__name">
                        {role.name} <span className={`badge badge--${role.module.toLowerCase()}`}>{role.module}</span>
                      </p>
                      <p className="role-list__desc">{role.description}</p>
                    </div>
                  </label>
                </li>
              )
            })}
            {filteredRoles.length === 0 && <p className="hint-small">No hay roles que coincidan con el filtro.</p>}
          </ul>
        </>
      )}

      <div className="step-panel__actions">
        <button type="button" className="btn btn-ghost" onClick={prevStep}>
          Atrás
        </button>
        <button type="button" className="btn btn-primary" onClick={nextStep}>
          Siguiente
        </button>
      </div>
    </section>
  )
}
