import { useState } from 'react'
import { assignRolesToUser, assignDataAccessSets } from '../api/mockApi'
import { useWizardState, useWizardActions } from '../context/WizardContext'
import { mockRoles, mockDataAccessSets } from '../data/mockData'
import Spinner from './common/Spinner'
import ErrorBanner from './common/ErrorBanner'

export default function SummaryStep() {
  const { targetUser, selectedRoleIds, roleSources, copiedFromUser, selectedDataAccessSetIds, saveResult } =
    useWizardState()
  const { prevStep, setSaveResult, reset } = useWizardActions()

  const [status, setStatus] = useState('idle') // idle | saving | done

  const selectedRoles = mockRoles.filter((r) => selectedRoleIds.includes(r.id))
  const selectedSets = mockDataAccessSets.filter((s) => selectedDataAccessSetIds.includes(s.id))

  async function handleSave() {
    setStatus('saving')
    setSaveResult(null)
    try {
      await assignRolesToUser(targetUser.id, selectedRoleIds)
      await assignDataAccessSets(targetUser.id, selectedDataAccessSetIds)
      setSaveResult({ success: true })
    } catch (err) {
      setSaveResult({ success: false, error: err })
    } finally {
      setStatus('done')
    }
  }

  if (saveResult?.success) {
    return (
      <section className="step-panel">
        <div className="success-screen">
          <div className="success-screen__icon">✓</div>
          <h2>Cambios guardados correctamente</h2>
          <p>
            <strong>{targetUser.displayName}</strong> (@{targetUser.userName}) ahora tiene {selectedRoles.length} rol(es)
            y {selectedSets.length} data access set(s) asignados.
          </p>
          <button type="button" className="btn btn-primary" onClick={reset}>
            Configurar otro usuario
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="step-panel">
      <h2>Confirmar y guardar</h2>
      <p className="step-panel__hint">Revisa los cambios antes de aplicarlos en Fusion.</p>

      <div className="summary-card">
        <h3>Usuario</h3>
        <p>
          {targetUser.displayName} — @{targetUser.userName} ({targetUser.email})
        </p>
      </div>

      <div className="summary-card">
        <h3>Roles ({selectedRoles.length})</h3>
        <ul className="summary-list">
          {selectedRoles.map((r) => (
            <li key={r.id}>
              {r.name}{' '}
              <span className="summary-tag">
                {roleSources[r.id] === 'base' ? 'rol base' : roleSources[r.id] === 'copied' ? 'copiado' : 'manual'}
              </span>
            </li>
          ))}
        </ul>
        {copiedFromUser && (
          <p className="hint-small">Incluye roles copiados de @{copiedFromUser.userName}.</p>
        )}
      </div>

      <div className="summary-card">
        <h3>Data Access Sets ({selectedSets.length})</h3>
        <ul className="summary-list">
          {selectedSets.map((s) => (
            <li key={s.id}>{s.name}</li>
          ))}
        </ul>
      </div>

      {status === 'saving' && <Spinner label="Guardando cambios en Fusion (roles + accesos de datos)…" />}
      {saveResult && !saveResult.success && <ErrorBanner error={saveResult.error} onRetry={handleSave} />}

      <div className="step-panel__actions">
        <button type="button" className="btn btn-ghost" onClick={prevStep} disabled={status === 'saving'}>
          Atrás
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={status === 'saving'}>
          Guardar cambios
        </button>
      </div>
    </section>
  )
}
