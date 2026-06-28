import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const calculationOperations = [
  {
    id: 'combinedWith',
    label: 'Combined with',
    description: 'The probability that both events occur.',
    formula: 'P(A) × P(B)',
    displayOrder: 1,
  },
  {
    id: 'either',
    label: 'Either',
    description: 'The probability that at least one event occurs.',
    formula: 'P(A) + P(B) − P(A)P(B)',
    displayOrder: 2,
  },
]

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

function mockFetch(calculationBody?: unknown) {
  return vi.fn((input: string | URL | Request) => {
    const url = input.toString()

    if (url === '/api/calculations/operations') {
      return jsonResponse(calculationOperations)
    }

    if (url === '/api/calculations' && calculationBody) {
      return jsonResponse(calculationBody)
    }

    return Promise.reject(new Error(`Unexpected request: ${url}`))
  })
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('renders calculation operations returned by the API', async () => {
    const fetchMock = vi.fn((input: string | URL | Request) => {
      const url = input.toString()

      if (url === '/api/calculations/operations') {
        return jsonResponse([
          {
            id: 'exclusiveOr',
            label: 'Exactly one',
            description: 'The probability that exactly one event occurs.',
            formula: 'P(A) + P(B) − 2P(A)P(B)',
            displayOrder: 1,
          },
        ])
      }

      return Promise.reject(new Error(`Unexpected request: ${url}`))
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    expect(await screen.findByRole('radio', { name: /exactly one/i }))
      .toBeChecked()
    expect(screen.getAllByText('P(A) + P(B) − 2P(A)P(B)')).toHaveLength(2)
    expect(fetchMock).toHaveBeenCalledWith('/api/calculations/operations')
  })

  it('submits a valid calculation and displays the API result', async () => {
    const fetchMock = mockFetch({
      probabilityA: 0.5,
      probabilityB: 0.5,
      operation: 'combinedWith',
      result: 0.25,
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()

    render(<App />)
    await screen.findByRole('radio', { name: /combined with/i })
    await user.click(
      screen.getByRole('button', { name: /calculate probability/i }),
    )

    expect(await screen.findByTestId('result-value')).toHaveTextContent('0.25')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/calculations',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          probabilityA: 0.5,
          probabilityB: 0.5,
          operation: 'combinedWith',
        }),
      }),
    )
  })

  it('shows client-side validation and does not call the API', async () => {
    const fetchMock = mockFetch()
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()

    render(<App />)
    await screen.findByRole('radio', { name: /combined with/i })
    const probabilityA = screen.getByLabelText(/probability a/i)

    await user.clear(probabilityA)
    await user.type(probabilityA, '1.1')
    await user.click(
      screen.getByRole('button', { name: /calculate probability/i }),
    )

    expect(screen.getByText('Enter a number from 0 to 1.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalledWith(
      '/api/calculations',
      expect.anything(),
    )
  })

  it('sends the selected Either operation', async () => {
    const fetchMock = mockFetch({
      probabilityA: 0.5,
      probabilityB: 0.5,
      operation: 'either',
      result: 0.75,
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()

    render(<App />)
    await user.click(await screen.findByRole('radio', { name: /either/i }))
    await user.click(
      screen.getByRole('button', { name: /calculate probability/i }),
    )

    expect(await screen.findByTestId('result-value')).toHaveTextContent('0.75')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/calculations',
      expect.objectContaining({
        body: expect.stringContaining('"operation":"either"'),
      }),
    )
  })
})
