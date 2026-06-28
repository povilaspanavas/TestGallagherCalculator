export type CalculationOperation = string

export interface CalculationOperationDefinition {
  id: CalculationOperation
  label: string
  description: string
  formula: string
  displayOrder: number
}

export interface CalculationRequest {
  probabilityA: number
  probabilityB: number
  operation: CalculationOperation
}

export interface CalculationResponse {
  probabilityA: number
  probabilityB: number
  operation: CalculationOperation
  result: number
}

export interface FormErrors {
  probabilityA?: string
  probabilityB?: string
  operation?: string
}