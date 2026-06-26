import type { FormErrors } from './types'

interface ValidationResult {
  errors: FormErrors
  values?: {
    probabilityA: number
    probabilityB: number
  }
}

function validateProbability(value: string) {
  if (value.trim() === '') {
    return { error: 'Enter a probability.' }
  }

  const parsedValue = Number(value)

  if (!Number.isFinite(parsedValue) || parsedValue < 0 || parsedValue > 1) {
    return { error: 'Enter a number from 0 to 1.' }
  }

  return { value: parsedValue }
}

export function validateCalculationForm(
  probabilityA: string,
  probabilityB: string,
): ValidationResult {
  const errors: FormErrors = {}
  const validatedA = validateProbability(probabilityA)
  const validatedB = validateProbability(probabilityB)

  if (validatedA.error) {
    errors.probabilityA = validatedA.error
  }

  if (validatedB.error) {
    errors.probabilityB = validatedB.error
  }

  if (validatedA.value === undefined || validatedB.value === undefined) {
    return { errors }
  }

  return {
    errors,
    values: {
      probabilityA: validatedA.value,
      probabilityB: validatedB.value,
    },
  }
}
