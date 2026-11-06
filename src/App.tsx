import { useState } from 'react'
import { LANGS, STRINGS, type Lang } from './i18n'
import { Board } from './Board'
import { countByState } from './domino'
import { oppModel } from './odds'
import { Panel } from './Panel'
import { advise } from './suggest'
import { useGame } from './useGame'
import { LangContext, useLangState, useT } from './useLang'

function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="langs" role="group" aria-label="Language / Idioma">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          className={l === lang ? 'on' : ''}
          aria-pressed={l === lang}
          title={STRINGS[l].langName}
          onClick={() => onChange(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function ResetButton({ onReset }: { onReset: () => void }) {
  const t = useT()
  const [confirming, setConfirming] = useState(false)
  if (!confirming)
    return (
      <button type="button" className="btn" onClick={() => setConfirming(true)}>
        {t.newRound}
      </button>
    )
  return (
    <span className="confirm">
      {t.confirmReset}
      <button
        type="button"
        className="btn danger"
        onClick={() => {
          onReset()
          setConfirming(false)
        }}
      >
        {t.yesReset}
      </button>
      <button type="button" className="btn" onClick={() => setConfirming(false)}>
        {t.cancel}
      </button>
    </span>
  )
}

export default function App() {
  const [game, dispatch] = useGame()
  const { lang, setLang, t } = useLangState()
  const { tiles } = game
  const model = oppModel(game)
  const advice = advise(game)
  const bestTile = advice.kind === 'moves' ? advice.moves[0].tile : null

  return (
    <LangContext value={t}>
      <main>
        <header>
          <h1>{t.title}</h1>
          <div className="actions">
            <ResetButton onReset={() => dispatch({ type: 'reset' })} />
            <LangToggle lang={lang} onChange={setLang} />
          </div>
        </header>

        <div className="layout">
          <div>
            <div className="legend">
              {(['unknown', 'arthur', 'table'] as const).map((s) => (
                <span key={s} className={`chip ${s}`}>
                  {t.state[s]} {countByState(tiles, s)}
                </span>
              ))}
              <span className="hint">{t.hint}</span>
            </div>

            <Board game={game} model={model} bestTile={bestTile} dispatch={dispatch} />
          </div>

          <Panel game={game} model={model} advice={advice} dispatch={dispatch} />
        </div>
      </main>
    </LangContext>
  )
}
