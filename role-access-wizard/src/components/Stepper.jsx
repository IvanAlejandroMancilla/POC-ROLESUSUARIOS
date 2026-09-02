import { STEPS, useWizardState, useWizardActions } from '../context/WizardContext'

export default function Stepper() {
  const { currentStepIndex } = useWizardState()
  const { goToStep } = useWizardActions()

  return (
    <ol className="stepper">
      {STEPS.map((step, index) => {
        const status = index < currentStepIndex ? 'done' : index === currentStepIndex ? 'active' : 'pending'
        const isClickable = index <= currentStepIndex
        return (
          <li key={step.key} className={`stepper__item stepper__item--${status}`}>
            <button
              type="button"
              className="stepper__button"
              disabled={!isClickable}
              onClick={() => isClickable && goToStep(index)}
            >
              <span className="stepper__dot">{status === 'done' ? '✓' : index + 1}</span>
              <span className="stepper__label">
                {step.label}
                {step.optional && <span className="stepper__optional"> (opcional)</span>}
              </span>
            </button>
            {index < STEPS.length - 1 && <span className="stepper__connector" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}
