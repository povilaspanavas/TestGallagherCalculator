import { useEffect, useState } from 'react'
import { getCalculationOperations } from '../api/calculations'
import type {
  CalculationOperation,
  CalculationOperationDefinition,
} from '../types'

const operationsLoadError =
  'The calculation options could not be loaded. Refresh and try again.'

export function useCalculationOperations() {
  const [operations, setOperations] = useState<CalculationOperationDefinition[]>([])
  const [operation, setOperation] = useState<CalculationOperation>('')
  const [operationsError, setOperationsError] = useState('')
  const [isLoadingOperations, setIsLoadingOperations] = useState(true)

  const selectedOperation = operations.find((option) => option.id === operation)

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
        setOperationsError(operationsLoadError)
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

  return {
    isLoadingOperations,
    operation,
    operations,
    operationsError,
    selectedOperation,
    setOperation,
  }
}
