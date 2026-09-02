import { createContext, useContext, useMemo, useReducer } from 'react'
import { BASE_ROLE } from '../data/mockData'

export const STEPS = [
  { key: 'search', label: 'Buscar usuario' },
  { key: 'roles', label: 'Asignar roles' },
  { key: 'copy', label: 'Copiar roles', optional: true },
  { key: 'access', label: 'Accesos a datos' },
  { key: 'confirm', label: 'Confirmar' },
]

const initialState = {
  currentStepIndex: 0,
  targetUser: null, // usuario destino validado (resultado del endpoint 1)
  selectedRoleIds: [BASE_ROLE.id], // rol base siempre presente
  roleSources: { [BASE_ROLE.id]: 'base' }, // roleId -> 'base' | 'manual' | 'copied'
  copiedFromUser: null, // { id, userName, displayName }
  selectedDataAccessSetIds: [],
  saveResult: null, // { success: true } | { success: false, error }
}

function reducer(state, action) {
  switch (action.type) {
    case 'GO_TO_STEP':
      return { ...state, currentStepIndex: action.index }
    case 'NEXT_STEP':
      return { ...state, currentStepIndex: Math.min(state.currentStepIndex + 1, STEPS.length - 1) }
    case 'PREV_STEP':
      return { ...state, currentStepIndex: Math.max(state.currentStepIndex - 1, 0) }
    case 'SET_TARGET_USER':
      return { ...state, targetUser: action.user }
    case 'TOGGLE_ROLE': {
      const { roleId } = action
      const isSelected = state.selectedRoleIds.includes(roleId)
      if (isSelected) {
        if (roleId === BASE_ROLE.id) return state // el rol base no se puede quitar
        const { [roleId]: _removed, ...restSources } = state.roleSources
        return {
          ...state,
          selectedRoleIds: state.selectedRoleIds.filter((id) => id !== roleId),
          roleSources: restSources,
        }
      }
      return {
        ...state,
        selectedRoleIds: [...state.selectedRoleIds, roleId],
        roleSources: { ...state.roleSources, [roleId]: 'manual' },
      }
    }
    case 'COPY_ROLES': {
      const { roleIds, fromUser } = action
      const merged = new Set(state.selectedRoleIds)
      const newSources = { ...state.roleSources }
      roleIds.forEach((id) => {
        merged.add(id)
        if (!newSources[id]) newSources[id] = 'copied'
      })
      return {
        ...state,
        selectedRoleIds: Array.from(merged),
        roleSources: newSources,
        copiedFromUser: fromUser,
      }
    }
    case 'SET_DATA_ACCESS_SETS':
      return { ...state, selectedDataAccessSetIds: action.ids }
    case 'SET_SAVE_RESULT':
      return { ...state, saveResult: action.result }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

const WizardStateContext = createContext(null)
const WizardDispatchContext = createContext(null)

export function WizardProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <WizardStateContext.Provider value={state}>
      <WizardDispatchContext.Provider value={dispatch}>{children}</WizardDispatchContext.Provider>
    </WizardStateContext.Provider>
  )
}

export function useWizardState() {
  const ctx = useContext(WizardStateContext)
  if (!ctx) throw new Error('useWizardState debe usarse dentro de WizardProvider')
  return ctx
}

export function useWizardDispatch() {
  const ctx = useContext(WizardDispatchContext)
  if (!ctx) throw new Error('useWizardDispatch debe usarse dentro de WizardProvider')
  return ctx
}

// Helper de conveniencia: acciones de alto nivel sobre el dispatch crudo.
export function useWizardActions() {
  const dispatch = useWizardDispatch()
  return useMemo(
    () => ({
      goToStep: (index) => dispatch({ type: 'GO_TO_STEP', index }),
      nextStep: () => dispatch({ type: 'NEXT_STEP' }),
      prevStep: () => dispatch({ type: 'PREV_STEP' }),
      setTargetUser: (user) => dispatch({ type: 'SET_TARGET_USER', user }),
      toggleRole: (roleId) => dispatch({ type: 'TOGGLE_ROLE', roleId }),
      copyRoles: (roleIds, fromUser) => dispatch({ type: 'COPY_ROLES', roleIds, fromUser }),
      setDataAccessSets: (ids) => dispatch({ type: 'SET_DATA_ACCESS_SETS', ids }),
      setSaveResult: (result) => dispatch({ type: 'SET_SAVE_RESULT', result }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [dispatch]
  )
}
