export default function Chip({ children, onRemove, tone = 'default' }) {
  return (
    <span className={`chip chip--${tone}`}>
      {children}
      {onRemove && (
        <button type="button" className="chip__remove" onClick={onRemove} aria-label="Quitar">
          ×
        </button>
      )}
    </span>
  )
}
