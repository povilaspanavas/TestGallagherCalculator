import type {
  CalculationOperationDefinition,
  CalculationResponse,
} from '../types'

interface ResultPanelProps {
  selectedOperation?: CalculationOperationDefinition
  operationPlaceholder: string
  calculationLine: string
  result: CalculationResponse | null
}

function formatProbability(value: number) {
  return new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 4,
  }).format(value)
}

function formatPercentage(value: number) {
  return new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 2,
  }).format(value * 100)
}

export function ResultPanel({
  selectedOperation,
  operationPlaceholder,
  calculationLine,
  result,
}: ResultPanelProps) {
  return (
    <aside className="result-panel" aria-live="polite">
      <div className="result-topline">
        <span>Result</span>
        <span className="result-operation">
          {selectedOperation?.label ?? operationPlaceholder}
        </span>
      </div>

      <div className={`result-content ${result ? 'has-result' : ''}`}>
        {result ? (
          <>
            <p className="result-label">Calculated probability</p>
            <p className="result-value" data-testid="result-value">
              {formatProbability(result.result)}
            </p>
            <p className="result-percentage">
              {formatPercentage(result.result)}%
            </p>
          </>
        ) : (
          <>
            <div className="empty-result-icon" aria-hidden="true">
              <span>?</span>
            </div>
            <p className="empty-result-title">Ready when you are</p>
            <p className="empty-result-copy">
              Your calculated probability will appear here.
            </p>
          </>
        )}
      </div>

      <div className="formula-card">
        <span>Formula</span>
        <strong>{calculationLine}</strong>
      </div>

      <p className="result-note">
        A probability of 0 means impossible; 1 means certain.
      </p>
    </aside>
  )
}