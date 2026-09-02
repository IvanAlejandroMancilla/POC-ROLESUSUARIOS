export default function ErrorBanner({ error, onRetry }) {
  if (!error) return null
  return (
    <div className="error-banner" role="alert">
      <div className="error-banner__icon" aria-hidden="true">!</div>
      <div className="error-banner__body">
        <p className="error-banner__message">{error.message || 'Ocurrió un error inesperado.'}</p>
        {error.code && <p className="error-banner__code">Código: {error.code}{error.status ? ` · HTTP ${error.status}` : ''}</p>}
      </div>
      {onRetry && (
        <button type="button" className="btn btn-ghost" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}
