import { useState } from 'react'
import { WizardProvider, useWizardState, STEPS } from './context/WizardContext'
import { setSimulateFailures } from './api/mockApi'
import Stepper from './components/Stepper'
import UserSearch from './components/UserSearch'
import RoleAssigner from './components/RoleAssigner'
import RoleCopier from './components/RoleCopier'
import DataAccessAssigner from './components/DataAccessAssigner'
import SummaryStep from './components/SummaryStep'
import './App.css'

const STEP_COMPONENTS = {
  search: UserSearch,
  roles: RoleAssigner,
  copy: RoleCopier,
  access: DataAccessAssigner,
  confirm: SummaryStep,
}

function WizardBody() {
  const { currentStepIndex } = useWizardState()
  const stepKey = STEPS[currentStepIndex].key
  const StepComponent = STEP_COMPONENTS[stepKey]
  return <StepComponent />
}

export default function App() {
  const [simulateFailures, setSimulateFailuresState] = useState(false)

  function handleToggleFailures(e) {
    const checked = e.target.checked
    setSimulateFailuresState(checked)
    setSimulateFailures(checked)
  }

  return (
    <WizardProvider>
      <div className="app-shell">
        <header className="app-header">
          <div>
            <h1>Administración de usuarios y seguridad — Oracle Fusion</h1>
            <p className="app-header__subtitle">
              Master Admin · Asignación de roles y data access sets (prototipo con datos mock)
            </p>
          </div>
          <label className="failure-toggle" title="Fuerza errores de red aleatorios para probar el manejo de errores">
            <input type="checkbox" checked={simulateFailures} onChange={handleToggleFailures} />
            Simular fallos de red
          </label>
        </header>

        <main className="app-main">
          <Stepper />
          <div className="app-main__content">
            <WizardBody />
          </div>
        </main>

        <footer className="app-footer">
          Prototipo funcional — endpoints y datos son simulados. Ver <code>docs/API_CONTRACT.md</code> para el contrato
          real de integración (Agente 2).
        </footer>
      </div>
    </WizardProvider>
  )
}
