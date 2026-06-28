type ProbabilityField = 'probabilityA' | 'probabilityB'

interface ProbabilityInputProps {
  field: ProbabilityField
  id: string
  label: string
  hint: string
  prefix: string
  value: string
  error?: string
  onChange: (field: ProbabilityField, value: string) => void
}

export function ProbabilityInput({
  field,
  id,
  label,
  hint,
  prefix,
  value,
  error,
  onChange,
}: ProbabilityInputProps) {
  const errorId = `${id}-error`

  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">
        {label} <span className="field-hint">{hint}</span>
      </span>
      <div className={`input-wrap ${error ? 'has-error' : ''}`}>
        <span className="input-prefix">{prefix}</span>
        <input
          id={id}
          name={field}
          type="number"
          min="0"
          max="1"
          step="any"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(field, event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
      </div>
      {error && (
        <span className="field-error" id={errorId}>
          {error}
        </span>
      )}
    </label>
  )
}
