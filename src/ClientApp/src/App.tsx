import { useEffect, useState } from 'react'
import {
  ApiError,
  calculateProbability,
  getCalculationOperations,
} from './api/calculations'
import type {
  CalculationOperation,
  CalculationOperationDefinition,
  CalculationResponse,
  FormErrors,
} from './types'
import { validateCalculationForm } from './validation'
import './App.css'

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

function getFormString(formData: FormData, field: string) {
  const value = formData.get(field)

  return typeof value === 'string' ? value : ''
}

function isCalculationOperation(
  value: FormDataEntryValue | null,
  operations: CalculationOperationDefinition[],
): value is CalculationOperation {
  return (
    typeof value === 'string' &&
    operations.some((operation) => operation.id === value)
  )
}

function getFormOperation(
  formData: FormData,
  operations: CalculationOperationDefinition[],
): CalculationOperation | undefined {
  const value = formData.get('operation')

  return isCalculationOperation(value, operations) ? value : undefined
}

function App() {
  const [probabilityA, setProbabilityA] = useState('0.5')
  const [probabilityB, setProbabilityB] = useState('0.5')
  const [operations, setOperations] = useState<CalculationOperationDefinition[]>([])
  const [operation, setOperation] = useState<CalculationOperation>('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [operationsError, setOperationsError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState<CalculationResponse | null>(null)
  const [isLoadingOperations, setIsLoadingOperations] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedOperation = operations.find((option) => option.id === operation)
  const canSubmit = !isLoadingOperations && operations.length > 0
  const operationPlaceholder = operationsError ? 'Unavailable' : 'Loading'
  const calculationLine = selectedOperation?.formula ?? operationPlaceholder

  useEffect(() => {
    let isCurrent = true

    async function loadOperations() {
      setIsLoadingOperations(true)

      try {
        const calculationOperations = await getCalculationOperations()
        const orderedOperations = [...calculationOperations].sort(
          (left, right) => left.displayOrder - right.displayOrder,
        )

        if (!isCurrent) {
          return
        }

        setOperations(orderedOperations)
        setOperation((current) =>
          orderedOperations.some((option) => option.id === current)
            ? current
            : (orderedOperations[0]?.id ?? ''),
        )
        setOperationsError('')
      } catch {
        if (!isCurrent) {
          return
        }

        setOperations([])
        setOperation('')
        setOperationsError(
          'The calculation options could not be loaded. Refresh and try again.',
        )
      } finally {
        if (isCurrent) {
          setIsLoadingOperations(false)
        }
      }
    }

    void loadOperations()

    return () => {
      isCurrent = false
    }
  }, [])

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

  async function submitCalculation(formData: FormData) {
    setSubmitError('')

    const submittedOperation = getFormOperation(formData, operations)
    const validation = validateCalculationForm(
      getFormString(formData, 'probabilityA'),
      getFormString(formData, 'probabilityB'),
    )
    const nextErrors: FormErrors = {
      ...validation.errors,
      operation: submittedOperation ? undefined : 'Choose a calculation.',
    }
    setErrors(nextErrors)

    if (!validation.values || !submittedOperation) {
      setResult(null)
      return
    }

    setIsSubmitting(true)

    try {
      const calculation = await calculateProbability({
        ...validation.values,
        operation: submittedOperation,
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
          <form className="calculator-form" action={submitCalculation} noValidate>
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

              {isLoadingOperations && (
                <span className="operation-status" role="status">
                  Loading calculations.
                </span>
              )}
              {operationsError && (
                <span className="operation-status is-error" role="alert">
                  {operationsError}
                </span>
              )}
              {!isLoadingOperations && !operationsError && (
                <div className="operation-grid">
                  {operations.map((option) => {
                    const isSelected = operation === option.id

                    return (
                      <label
                        className={`operation-card ${isSelected ? 'is-selected' : ''}`}
                        key={option.id}
                      >
                        <input
                          type="radio"
                          name="operation"
                          value={option.id}
                          checked={isSelected}
                          onChange={() => updateOperation(option.id)}
                        />
                        <span className="operation-index" aria-hidden="true">
                          {option.displayOrder.toString().padStart(2, '0')}
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
                  })}
                </div>
              )}
              {errors.operation && (
                <span className="field-error">{errors.operation}</span>
              )}
            </fieldset>

            {submitError && (
              <div className="submit-error" role="alert">
                {submitError}
              </div>
            )}

            <button
              className="calculate-button"
              type="submit"
              disabled={isSubmitting || !canSubmit}
            >
              <span>{isSubmitting ? 'Calculating…' : 'Calculate probability'}</span>
              <span className="button-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </form>

          <aside className="result-panel" aria-live="polite">
            <div className="result-topline">
              <span>Result</span>
              <span className="result-operation">
                {selectedOperation?.label ?? operationPlaceholder}
              </span>
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
