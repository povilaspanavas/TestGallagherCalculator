import { describe, expect, it } from 'vitest'
import { validateCalculationForm } from './validation'

describe('validateCalculationForm', () => {
  it('accepts values at both probability boundaries', () => {
    const result = validateCalculationForm('0', '1')

    expect(result.errors).toEqual({})
    expect(result.values).toEqual({
      probabilityA: 0,
      probabilityB: 1,
    })
  })

  it('requires both probabilities', () => {
    const result = validateCalculationForm('', ' ')

    expect(result.values).toBeUndefined()
    expect(result.errors).toEqual({
      probabilityA: 'Enter a probability.',
      probabilityB: 'Enter a probability.',
    })
  })

  it('rejects values outside the range from zero to one', () => {
    const result = validateCalculationForm('-0.1', '1.1')

    expect(result.values).toBeUndefined()
    expect(result.errors).toEqual({
      probabilityA: 'Enter a number from 0 to 1.',
      probabilityB: 'Enter a number from 0 to 1.',
    })
  })
})
