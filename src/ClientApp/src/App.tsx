import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError, calculateProbability } from './api/calculations'
import type {
  CalculationOperation,
  CalculationResponse,
  FormErrors,
} from './types'
import { validateCalculationForm } from './validation'
import './App.css'

const operations: Record<
  CalculationOperation,
  {
    label: string
    description: string
    formula: string
    symbol: string
  }
> = {
  combinedWith: {
    label: 'Combined with',
    description: 'The probability that both events occur.',
    formula: 'P(A) × P(B)',
    symbol: '×',
  },
  either: {
    label: 'Either',
    description: 'The probability that at least one event occurs.',
    formula: 'P(A) + P(B) − P(A)P(B)',
    symbol: '∪',
  },
}

function formatProbability(value: number) {
  return new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 10,
  }).format(value)
}

function formatPercentage(value: number) {
  return new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 4,
  }).format(value * 100)
}

function App() {
  const [probabilityA, setProbabilityA] = useState('0.5')
  const [probabilityB, setProbabilityB] = useState('0.5')
  const [operation, setOperation] =
    useState<CalculationOperation>('combinedWith')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState<CalculationResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedOperation = operations[operation]

  const calculationLine = useMemo(() => {
    if (!result) {
      return selectedOperation.formula
    }

    const a = formatProbability(result.probabilityA)
    const b = formatProbability(result.probabilityB)

    return result.operation === 'combinedWith'
      ? `${a} × ${b}`
      : `${a} + ${b} − (${a} × ${b})`
  }, [result, selectedOperation.formula])

  function updateProbability(
    field: 'probabilityA' | 'probabilityB',
    value: string,
  ) {
    if (field === 'probabilityA') {
      setProbabilityA(value)
    } else {
      setProbabilityB(value)
    }

    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitError('')
    setResult(null)
  }

  function updateOperation(nextOperation: CalculationOperation) {
    setOperation(nextOperation)
    setErrors((current) => ({ ...current, operation: undefined }))
    setSubmitError('')
    setResult(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError('')

    const validation = validateCalculationForm(probabilityA, probabilityB)
    setErrors(validation.errors)

    if (!validation.values) {
      setResult(null)
      return
    }

    setIsSubmitting(true)

    try {
      const calculation = await calculateProbability({
        ...validation.values,
        operation,
      })
      setResult(calculation)
    } catch (error) {
      setResult(null)

      if (error instanceof ApiError) {
        setErrors(error.fieldErrors)
        setSubmitError(error.message)
      } else {
        setSubmitError(
          'The calculator could not be reached. Check that the API is running and try again.',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Probability Calculator home">
          <span className="brand-mark" aria-hidden="true">
            P
          </span>
          <span>Probability Calculator</span>
        </a>
        <span className="api-status">
          <span className="status-dot" aria-hidden="true" />
          Calculator ready
        </span>
      </header>

      <main>
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">Investment probability tool</p>
          <h1 id="page-title">Make uncertainty easier to calculate.</h1>
          <p className="intro-copy">
            Enter two probabilities, choose how the events relate, and get an
            instant result.
          </p>
        </section>

        <section className="calculator-card" aria-label="Probability calculator">
          <form className="calculator-form" onSubmit={handleSubmit} noValidate>
            <div className="form-heading">
              <span className="step-number">01</span>
              <div>
                <h2>Enter probabilities</h2>
                <p>Use a number from 0 to 1 for each event.</p>
              </div>
            </div>

            <div className="probability-grid">
              <label className="field" htmlFor="probability-a">
                <span className="field-label">
                  Probability A <span className="field-hint">P(A)</span>
                </span>
                <div
                  className={`input-wrap ${errors.probabilityA ? 'has-error' : ''}`}
                >
                  <span className="input-prefix">A</span>
                  <input
                    id="probability-a"
                    name="probabilityA"
                    type="number"
                    min="0"
                    max="1"
                    step="any"
                    inputMode="decimal"
                    value={probabilityA}
                    onChange={(event) =>
                      updateProbability('probabilityA', event.target.value)
                    }
                    aria-invalid={Boolean(errors.probabilityA)}
                    aria-describedby={
                      errors.probabilityA ? 'probability-a-error' : undefined
                    }
                  />
                </div>
                {errors.probabilityA && (
                  <span className="field-error" id="probability-a-error">
                    {errors.probabilityA}
                  </span>
                )}
              </label>

              <label className="field" htmlFor="probability-b">
                <span className="field-label">
                  Probability B <span className="field-hint">P(B)</span>
                </span>
                <div
                  className={`input-wrap ${errors.probabilityB ? 'has-error' : ''}`}
                >
                  <span className="input-prefix">B</span>
                  <input
                    id="probability-b"
                    name="probabilityB"
                    type="number"
                    min="0"
                    max="1"
                    step="any"
                    inputMode="decimal"
                    value={probabilityB}
                    onChange={(event) =>
                      updateProbability('probabilityB', event.target.value)
                    }
                    aria-invalid={Boolean(errors.probabilityB)}
                    aria-describedby={
                      errors.probabilityB ? 'probability-b-error' : undefined
                    }
                  />
                </div>
                {errors.probabilityB && (
                  <span className="field-error" id="probability-b-error">
                    {errors.probabilityB}
                  </span>
                )}
              </label>
            </div>

            <fieldset className="operation-fieldset">
              <legend>
                <span className="step-number">02</span>
                <span>
                  <strong>Choose a calculation</strong>
                  <small>How should the two events be combined?</small>
                </span>
              </legend>

              <div className="operation-grid">
                {(Object.keys(operations) as CalculationOperation[]).map(
                  (operationKey) => {
                    const option = operations[operationKey]
                    const isSelected = operation === operationKey

                    return (
                      <label
                        className={`operation-card ${isSelected ? 'is-selected' : ''}`}
                        key={operationKey}
                      >
                        <input
                          type="radio"
                          name="operation"
                          value={operationKey}
                          checked={isSelected}
                          onChange={() => updateOperation(operationKey)}
                        />
                        <span className="operation-symbol" aria-hidden="true">
                          {option.symbol}
                        </span>
                        <span className="operation-copy">
                          <strong>{option.label}</strong>
                          <small>{option.description}</small>
                          <code>{option.formula}</code>
                        </span>
                        <span className="selection-indicator" aria-hidden="true">
                          ✓
                        </span>
                      </label>
                    )
                  },
                )}
              </div>
              {errors.operation && (
                <span className="field-error">{errors.operation}</span>
              )}
            </fieldset>

            {submitError && (
              <div className="submit-error" role="alert">
                {submitError}
              </div>
            )}

            <button className="calculate-button" type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Calculating…' : 'Calculate probability'}</span>
              <span className="button-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </form>

          <aside className="result-panel" aria-live="polite">
            <div className="result-topline">
              <span>Result</span>
              <span className="result-operation">{selectedOperation.label}</span>
            </div>

            <div className={`result-content ${result ? 'has-result' : ''}`}>
              {result ? (
                <>
                  <p className="result-label">Calculated probability</p>
                  <p className="result-value" data-testid="result-value">
                    {formatProbability(result.result)}
                  </p>
                  <p className="result-percentage">
                    {formatPercentage(result.result)}%
                  </p>
                </>
              ) : (
                <>
                  <div className="empty-result-icon" aria-hidden="true">
                    <span>?</span>
                  </div>
                  <p className="empty-result-title">Ready when you are</p>
                  <p className="empty-result-copy">
                    Your calculated probability will appear here.
                  </p>
                </>
              )}
            </div>

            <div className="formula-card">
              <span>Formula</span>
              <strong>{calculationLine}</strong>
            </div>

            <p className="result-note">
              A probability of 0 means impossible; 1 means certain.
            </p>
          </aside>
        </section>
      </main>

      <footer>
        <span>Built for clear, quick probability calculations.</span>
        <span>Values accepted from 0 to 1.</span>
      </footer>
    </div>
  )
}

export default App
