import type { CSSProperties } from 'react'
import type { Pip, TileState } from './domino'
import { useT } from './useLang'

// Pip positions on a 3x3 grid (col, row), like a real domino face.
const FACES: Record<Pip, [number, number][]> = {
  0: [],
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
}

function Half({ n, x }: { n: Pip; x: number }) {
  return FACES[n].map(([c, r]) => (
    <circle key={`${c}${r}`} cx={x + 10 + c * 10} cy={10 + r * 10} r={3.2} />
  ))
}

/** Face-only drawing of a domino, left half first. */
export function DominoFace({ left, right }: { left: Pip; right: Pip }) {
  return (
    <svg viewBox="0 0 80 40" className="face" aria-hidden>
      <rect x={1} y={1} width={78} height={38} rx={6} className="body" />
      <line x1={40} y1={6} x2={40} y2={34} className="divider" />
      <g className="pips">
        <Half n={left} x={0} />
        <Half n={right} x={40} />
      </g>
    </svg>
  )
}

/** One half of a domino, for picking an end number. */
export function PipSquare({ n }: { n: Pip }) {
  return (
    <svg viewBox="0 0 40 40" className="face" aria-hidden>
      <rect x={1} y={1} width={38} height={38} rx={6} className="body" />
      <g className="pips">
        <Half n={n} x={0} />
      </g>
    </svg>
  )
}

export function TileButton({
  left,
  right,
  state,
  best,
  style,
  onForward,
  onBack,
}: {
  left: Pip
  right: Pip
  state: TileState
  best?: boolean
  style?: CSSProperties
  onForward: () => void
  onBack: () => void
}) {
  const label = useT().tileState[state]
  return (
    <button
      type="button"
      className={`tile ${state}${best ? ' best' : ''}`}
      style={style}
      title={`${left}|${right}: ${label}`}
      aria-label={`${left}|${right}, ${label}`}
      onClick={onForward}
      onContextMenu={(e) => {
        e.preventDefault()
        onBack()
      }}
    >
      <DominoFace left={left} right={right} />
    </button>
  )
}
