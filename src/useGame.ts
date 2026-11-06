import { useEffect, useReducer } from 'react'
import { parseGame, reducer } from './game'

const STORAGE_KEY = 'rdr2-domino'

export function useGame() {
  const [game, dispatch] = useReducer(reducer, null, () =>
    parseGame(localStorage.getItem(STORAGE_KEY)),
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
  }, [game])

  return [game, dispatch] as const
}
