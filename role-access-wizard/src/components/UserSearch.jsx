import { useEffect, useRef, useState } from 'react'
import { searchUser, suggestUsers } from '../api/mockApi'
import { useWizardState, useWizardActions } from '../context/WizardContext'
import Spinner from './common/Spinner'
import ErrorBanner from './common/ErrorBanner'

export default function UserSearch() {
  const { targetUser } = useWizardState()
  const { setTargetUser, nextStep } = useWizardActions()

  const [query, setQuery] = useState(targetUser?.userName ?? '')
  const [suggestions, setSuggestions] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (targetUser) return
    clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setSuggestions([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      const results = await suggestUsers(query)
      setSuggestions(results)
    }, 250)
    return () => clearTimeout(debounceRef.current)
  }, [query, targetUser])

  async function handleSearch(userNameOverride) {
    const userName = (userNameOverride ?? query).trim()
    if (!userName) return
    setStatus('loading')
    setError(null)
    setSuggestions([])
    try {
      const user = await searchUser(userName)
      setTargetUser(user)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err)
    }
  }

  function handleChangeUser() {
    setTargetUser(null)
    setStatus('idle')
    setError(null)
    setQuery('')
  }

  return (
    <section className="step-panel">
      <h2>Buscar usuario</h2>
      <p className="step-panel__hint">
        Ingresa el <strong>username</strong> del usuario en Fusion/IDCS. Se validará su existencia antes de continuar.
      </p>

      {!targetUser && (
        <div className="search-box">
          <div className="search-box__row">
            <input
              type="text"
              className="input"
              placeholder="ej. jperez"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              autoFocus
            />
            <button type="button" className="btn btn-primary" onClick={() => handleSearch()} disabled={status === 'loading'}>
              Buscar
            </button>
          </div>

          {suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button type="button" onClick={() => { setQuery(s.userName); handleSearch(s.userName) }}>
                    <strong>{s.userName}</strong> — {s.displayName}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {status === 'loading' && <Spinner label="Consultando IDCS…" />}
          {status === 'error' && <ErrorBanner error={error} onRetry={() => handleSearch()} />}

          <p className="hint-small">Prueba con: jperez, mgonzalez, crodriguez, ftorres, lsilva (o un username inexistente para ver el error).</p>
        </div>
      )}

      {targetUser && (
        <div className="user-card">
          <div className="user-card__avatar" aria-hidden="true">
            {targetUser.displayName.split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </div>
          <div className="user-card__info">
            <p className="user-card__name">{targetUser.displayName}</p>
            <p className="user-card__meta">@{targetUser.userName} · {targetUser.email}</p>
            <p className="user-card__meta">{targetUser.department}</p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={handleChangeUser}>
            Cambiar usuario
          </button>
        </div>
      )}

      <div className="step-panel__actions">
        <span />
        <button type="button" className="btn btn-primary" disabled={!targetUser} onClick={nextStep}>
          Siguiente
        </button>
      </div>
    </section>
  )
}
