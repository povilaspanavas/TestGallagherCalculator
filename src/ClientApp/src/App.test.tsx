import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('submits a valid calculation and displays the API result', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          probabilityA: 0.5,
          probabilityB: 0.5,
          operation: 'combinedWith',
          result: 0.25,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()

    render(<App />)
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
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()

    render(<App />)
    const probabilityA = screen.getByLabelText(/probability a/i)

    await user.clear(probabilityA)
    await user.type(probabilityA, '1.1')
    await user.click(
      screen.getByRole('button', { name: /calculate probability/i }),
    )

    expect(screen.getByText('Enter a number from 0 to 1.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends the selected Either operation', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          probabilityA: 0.5,
          probabilityB: 0.5,
          operation: 'either',
          result: 0.75,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()

    render(<App />)
    await user.click(screen.getByRole('radio', { name: /either/i }))
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
