import { useState } from 'react'
import { searchUser, getUserRoles } from '../api/mockApi'
import { useWizardState, useWizardActions } from '../context/WizardContext'
import Spinner from './common/Spinner'
import ErrorBanner from './common/ErrorBanner'

export default function RoleCopier() {
  const { targetUser, copiedFromUser } = useWizardState()
  const { copyRoles, nextStep, prevStep } = useWizardActions()

  const [query, setQuery] = useState('')
  const [sourceUser, setSourceUser] = useState(null)
  const [sourceRoles, setSourceRoles] = useState([])
  const [checkedRoleIds, setCheckedRoleIds] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)

  async function handleSearchSource() {
    const userName = query.trim()
    if (!userName) return
    setStatus('loading')
    setError(null)
    try {
      const user = await searchUser(userName)
      if (targetUser && user.id === targetUser.id) {
        throw new Error('El usuario origen no puede ser el mismo que el usuario destino.')
      }
      const roles = await getUserRoles(user.id)
      setSourceUser(user)
      setSourceRoles(roles)
      setCheckedRoleIds(roles.map((r) => r.id))
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err)
    }
  }

  function toggleChecked(roleId) {
    setCheckedRoleIds((prev) => (prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]))
  }

  function handleApplyCopy() {
    if (!sourceUser || checkedRoleIds.length === 0) return
    copyRoles(checkedRoleIds, { id: sourceUser.id, userName: sourceUser.userName, displayName: sourceUser.displayName })
  }

  return (
    <section className="step-panel">
      <h2>Copiar roles de otro usuario</h2>
      <p className="step-panel__hint">
        Paso opcional. Fusion no expone "copiar roles" como operación atómica: esta pantalla <em>lee</em> los roles del
        usuario origen y luego los <em>reescribe</em> en el destino al confirmar (flujo compuesto).
      </p>

      <div className="search-box">
        <div className="search-box__row">
          <input
            type="text"
            className="input"
            placeholder="Username del usuario origen (ej. mgonzalez)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSource()}
          />
          <button type="button" className="btn btn-primary" onClick={handleSearchSource} disabled={status === 'loading'}>
            Buscar
          </button>
        </div>
        {status === 'loading' && <Spinner label="Buscando usuario y sus roles…" />}
        {status === 'error' && <ErrorBanner error={error} onRetry={handleSearchSource} />}
      </div>

      {status === 'success' && sourceUser && (
        <div className="copy-panel">
          <p className="copy-panel__source">
            Roles actuales de <strong>{sourceUser.displayName}</strong> (@{sourceUser.userName}):
          </p>
          {sourceRoles.length === 0 && <p className="hint-small">Este usuario no tiene roles asignados.</p>}
          <ul className="role-list">
            {sourceRoles.map((role) => (
              <li key={role.id} className="role-list__item">
                <label>
                  <input
                    type="checkbox"
                    checked={checkedRoleIds.includes(role.id)}
                    onChange={() => toggleChecked(role.id)}
                  />
                  <div>
                    <p className="role-list__name">
                      {role.name} <span className={`badge badge--${role.module.toLowerCase()}`}>{role.module}</span>
                    </p>
                  </div>
                </label>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-secondary" onClick={handleApplyCopy} disabled={checkedRoleIds.length === 0}>
            Copiar {checkedRoleIds.length} rol(es) seleccionados al destino
          </button>
        </div>
      )}

      {copiedFromUser && (
        <p className="hint-success">
          ✓ Roles copiados desde @{copiedFromUser.userName}. Puedes ajustarlos en el paso "Asignar roles".
        </p>
      )}

      <div className="step-panel__actions">
        <button type="button" className="btn btn-ghost" onClick={prevStep}>
          Atrás
        </button>
        <button type="button" className="btn btn-primary" onClick={nextStep}>
          {copiedFromUser ? 'Siguiente' : 'Omitir / Siguiente'}
        </button>
      </div>
    </section>
  )
}
