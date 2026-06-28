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

export interface CalculationResponse extends CalculationRequest {
  result: number
}

export interface FormErrors {
  probabilityA?: string
  probabilityB?: string
  operation?: string
}
