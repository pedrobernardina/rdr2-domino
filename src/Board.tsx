import type { Dispatch } from 'react'
import { PIPS, tileId, unknownWith, type Pip, type TileId } from './domino'
import { openEnds, type Action, type Game } from './game'
import { pHasNumber, type OppModel } from './odds'
import { TileButton } from './Tile'
import { useT } from './useLang'

function NumSummary({
  unknown,
  clued,
  p,
}: {
  unknown: number
  clued: boolean
  p: number
}) {
  const t = useT()
  const none = clued || unknown === 0 || p === 0
  return (
    <>
      <span className="count">
        {unknown === 0 ? (
          t.allSeen
        ) : (
          <span>
            <strong>{unknown}</strong> {t.unknownWord(unknown)}
          </span>
        )}
      </span>
      <span className={`odds${none ? ' none' : ''}`}>
        {clued ? t.clued : none ? t.none : t.has(p)}
      </span>
    </>
  )
}

/**
 * Triangle of the 28 tiles, each shown once: tile i|j sits at row i,
 * column j. Every tile with number n lies on row n plus column n.
 */
export function Board({
  game,
  model,
  bestTile,
  dispatch,
}: {
  game: Game
  model: OppModel
  bestTile: TileId | null
  dispatch: Dispatch<Action>
}) {
  const ends = openEnds(game.ends)
  const numClass = (n: Pip) => `num${ends.includes(n) ? ' end' : ''}`

  return (
    <section className="board">
      {PIPS.map((n) => (
        <div key={`c${n}`} className="colhead" style={{ gridColumn: n + 2, gridRow: 1 }}>
          <span className={numClass(n)}>{n}</span>
        </div>
      ))}
      {PIPS.map((i) => (
        <div key={`r${i}`} className="summary" style={{ gridColumn: 1, gridRow: i + 2 }}>
          <span className={numClass(i)}>{i}</span>
          <span className="text">
            <NumSummary
              unknown={unknownWith(game.tiles, i)}
              clued={game.clue.includes(i)}
              p={pHasNumber(model, i)}
            />
          </span>
        </div>
      ))}
      {PIPS.flatMap((i) =>
        PIPS.filter((j) => j >= i).map((j) => {
          const id = tileId(i, j)
          return (
            <TileButton
              key={id}
              left={i}
              right={j}
              state={game.tiles[id]}
              best={id === bestTile}
              style={{ gridColumn: j + 2, gridRow: i + 2 }}
              onForward={() => dispatch({ type: 'step', id, dir: 1 })}
              onBack={() => dispatch({ type: 'step', id, dir: -1 })}
            />
          )
        }),
      )}
    </section>
  )
}
