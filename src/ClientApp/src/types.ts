export type CalculationOperation = 'combinedWith' | 'either'

export interface CalculationRequest {
  probabilityA: number
  probabilityB: number
  operation: CalculationOperation
}

export interface CalculationResponse extends CalculationRequest {
  result: number
}

export interface FormErrors {
  probabilityA?: string
  probabilityB?: string
  operation?: string
}
