import { useEffect, useState } from 'react'
import { getAllDataAccessSets } from '../api/mockApi'
import { useWizardState, useWizardActions } from '../context/WizardContext'
import { BASE_ROLE } from '../data/mockData'

export default function DataAccessAssigner() {
  const { selectedDataAccessSetIds } = useWizardState()
  const { setDataAccessSets, nextStep, prevStep } = useWizardActions()

  const [sets, setSets] = useState([])

  useEffect(() => {
    setSets(getAllDataAccessSets())
  }, [])

  function toggle(id) {
    if (selectedDataAccessSetIds.includes(id)) {
      setDataAccessSets(selectedDataAccessSetIds.filter((x) => x !== id))
    } else {
      setDataAccessSets([...selectedDataAccessSetIds, id])
    }
  }

  return (
    <section className="step-panel">
      <h2>Rol base y accesos a datos</h2>

      <div className="base-role-banner">
        <span className="base-role-banner__check">✓</span>
        <div>
          <p className="base-role-banner__title">{BASE_ROLE.name}</p>
          <p className="base-role-banner__desc">Asignado automáticamente a todo usuario nuevo.</p>
        </div>
      </div>

      <p className="step-panel__hint">
        Selecciona uno o varios <strong>data access sets</strong> para el usuario.
      </p>

      <ul className="role-list">
        {sets.map((set) => {
          const checked = selectedDataAccessSetIds.includes(set.id)
          return (
            <li key={set.id} className={`role-list__item ${checked ? 'is-selected' : ''}`}>
              <label>
                <input type="checkbox" checked={checked} onChange={() => toggle(set.id)} />
                <div>
                  <p className="role-list__name">
                    {set.name}{' '}
                    <span className={`badge ${set.accessLevel === 'Read Only' ? 'badge--common' : 'badge--fscm'}`}>
                      {set.accessLevel}
                    </span>
                  </p>
                  <p className="role-list__desc">Business Unit: {set.businessUnit}</p>
                </div>
              </label>
            </li>
          )
        })}
      </ul>

      <div className="step-panel__actions">
        <button type="button" className="btn btn-ghost" onClick={prevStep}>
          Atrás
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={selectedDataAccessSetIds.length === 0}
          onClick={nextStep}
        >
          Siguiente
        </button>
      </div>
    </section>
  )
}
