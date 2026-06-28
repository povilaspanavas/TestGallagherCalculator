import type {
  CalculationOperationDefinition,
  CalculationRequest,
  CalculationResponse,
  FormErrors,
} from '../types'

interface ValidationProblem {
  title?: string
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  readonly fieldErrors: FormErrors

  constructor(
    message: string,
    fieldErrors: FormErrors = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.fieldErrors = fieldErrors
  }
}

export async function calculateProbability(
  request: CalculationRequest,
): Promise<CalculationResponse> {
  const response = await fetch('/api/calculations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    let problem: ValidationProblem | undefined

    try {
      problem = (await response.json()) as ValidationProblem
    } catch {
      problem = undefined
    }

    const fieldErrors: FormErrors = {
      probabilityA: problem?.errors?.probabilityA?.[0],
      probabilityB: problem?.errors?.probabilityB?.[0],
      operation: problem?.errors?.operation?.[0],
    }

    throw new ApiError(
      problem?.title ?? 'The calculation could not be completed.',
      fieldErrors,
    )
  }

  return (await response.json()) as CalculationResponse
}

export async function getCalculationOperations(): Promise<
  CalculationOperationDefinition[]
> {
  const response = await fetch('/api/calculations/operations')

  if (!response.ok) {
    throw new ApiError('The calculation options could not be loaded.')
  }

  return (await response.json()) as CalculationOperationDefinition[]
}
