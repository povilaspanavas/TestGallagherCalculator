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
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Intro } from './components/Intro'
import { ProbabilityInput } from './components/ProbabilityInput'
import { ResultPanel } from './components/ResultPanel'
import { validateCalculationForm } from './validation'
import './App.css'

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
      <Header />

      <main>
        <Intro />

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
              <ProbabilityInput
                field="probabilityA"
                id="probability-a"
                label="Probability A"
                hint="P(A)"
                prefix="A"
                value={probabilityA}
                error={errors.probabilityA}
                onChange={updateProbability}
              />

              <ProbabilityInput
                field="probabilityB"
                id="probability-b"
                label="Probability B"
                hint="P(B)"
                prefix="B"
                value={probabilityB}
                error={errors.probabilityB}
                onChange={updateProbability}
              />
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

          <ResultPanel
            selectedOperation={selectedOperation}
            operationPlaceholder={operationPlaceholder}
            calculationLine={calculationLine}
            result={result}
          />
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default App
