import type { Dispatch } from 'react'
import { PIPS, type Pip } from './domino'
import { boneyard, openEnds, type Action, type End, type Game } from './game'
import type { Strings } from './i18n'
import type { OppModel } from './odds'
import type { Advice, Move, Reason } from './suggest'
import { DominoFace, PipSquare } from './Tile'
import { useT } from './useLang'

function EndPicker({
  label,
  value,
  onPick,
}: {
  label: string
  value: End
  onPick: (n: Pip) => void
}) {
  const t = useT()
  return (
    <div className="endpicker">
      <span className="lbl">{label}</span>
      {PIPS.map((n) => (
        <button
          key={n}
          type="button"
          className={`pipbtn${value === n ? ' on' : ''}`}
          aria-pressed={value === n}
          title={value === n ? t.clickToClear : t.endPick(label, n)}
          onClick={() => onPick(n)}
        >
          <PipSquare n={n} />
          <span>{n}</span>
        </button>
      ))}
    </div>
  )
}

function Controls({
  game,
  model,
  dispatch,
}: {
  game: Game
  model: OppModel
  dispatch: Dispatch<Action>
}) {
  const t = useT()
  const bone = boneyard(game)
  const hasEnds = openEnds(game.ends).length > 0
  const set = (value: number) => dispatch({ type: 'setOppHand', value })

  return (
    <section className="card">
      <h2>{t.endsTitle}</h2>
      <EndPicker
        label="A"
        value={game.ends[0]}
        onPick={(value) => dispatch({ type: 'toggleEnd', side: 0, value })}
      />
      <EndPicker
        label="B"
        value={game.ends[1]}
        onPick={(value) => dispatch({ type: 'toggleEnd', side: 1, value })}
      />

      <div className="opp">
        <span>{t.oppHand}</span>
        <div className="stepper">
          <button type="button" className="btn" onClick={() => set(game.oppHand - 1)}>
            −
          </button>
          <strong>{game.oppHand}</strong>
          <button type="button" className="btn" onClick={() => set(game.oppHand + 1)}>
            +
          </button>
        </div>
        <span className="muted">{t.boneyard(Math.max(0, bone))}</span>
      </div>

      <button
        type="button"
        className="btn drew"
        disabled={!hasEnds}
        onClick={() => dispatch({ type: 'oppDrew' })}
      >
        {bone > 0 ? t.oppDrew : t.oppPassed}
      </button>

      {game.clue.length > 0 && (
        <div className="clue">
          {t.clue}
          {game.clue.map((n) => (
            <button
              key={n}
              type="button"
              className="cluechip"
              title={t.removeClue}
              onClick={() => dispatch({ type: 'removeClue', n })}
            >
              {n} ×
            </button>
          ))}
        </div>
      )}

      {model.overflow && (
        <p className="warn">{t.overflow(game.oppHand, model.pool.length)}</p>
      )}
    </section>
  )
}

function Reasons({ reasons }: { reasons: Reason[] }) {
  const t = useT()
  return (
    <ul className="reasons">
      {reasons.map((r) => (
        <li key={r.kind} className={r.tone}>
          {t.reason(r)}
        </li>
      ))}
    </ul>
  )
}

const MoveFace = ({ m }: { m: Move }) => <DominoFace left={m.on ?? m.ends[0]} right={m.out} />

function moveText(t: Strings, m: Move) {
  const name = `${m.on ?? m.ends[0]}|${m.out}`
  return m.on === null
    ? { title: t.lead(name), sub: t.leadSub(...m.ends) }
    : { title: t.play(name, m.on), sub: t.playSub(...m.ends) }
}

function Suggestions({ advice }: { advice: Advice }) {
  const t = useT()
  let body
  switch (advice.kind) {
    case 'noHand':
      body = <p className="muted">{t.noHand}</p>
      break
    case 'needEnds':
      body = <p className="muted">{t.needEnds}</p>
      break
    case 'stuck':
      body = (
        <div className="best">
          <strong className="big">{advice.boneyard > 0 ? t.draw : t.pass}</strong>
          <p className="muted">{t.nothingFits(advice.ends)}</p>
        </div>
      )
      break
    case 'moves': {
      const [best, ...rest] = advice.moves
      const bt = moveText(t, best)
      body = (
        <>
          <div className="best">
            <div className="movehead">
              <MoveFace m={best} />
              <div>
                <strong className="big">{bt.title}</strong>
                <div className="muted">{bt.sub}</div>
              </div>
            </div>
            <Reasons reasons={best.reasons} />
          </div>
          {rest.length > 0 && (
            <ol className="others">
              {rest.map((m) => {
                const o = moveText(t, m)
                return (
                  <li key={`${m.tile}@${m.on}`}>
                    <div className="movehead">
                      <MoveFace m={m} />
                      <div>
                        <strong>{o.title}</strong>
                        <div className="muted">{o.sub}</div>
                      </div>
                    </div>
                    <Reasons reasons={m.reasons} />
                  </li>
                )
              })}
            </ol>
          )}
        </>
      )
    }
  }
  return (
    <section className="card">
      <h2>{t.suggestion}</h2>
      {body}
    </section>
  )
}

export function Panel(props: {
  game: Game
  model: OppModel
  advice: Advice
  dispatch: Dispatch<Action>
}) {
  return (
    <aside className="panel">
      <Controls game={props.game} model={props.model} dispatch={props.dispatch} />
      <Suggestions advice={props.advice} />
    </aside>
  )
}
