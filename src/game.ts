import {
  ALL_TILES,
  countByState,
  emptyTiles,
  nextState,
  prevState,
  type Pip,
  type TileId,
  type Tiles,
} from './domino'

export type End = Pip | null

/** Everything about the current round, saved between visits. */
export type Game = {
  tiles: Tiles
  /** The two open ends of the line; both null before the first play. */
  ends: [End, End]
  /** How many tiles the opponent holds, as shown in-game. */
  oppHand: number
  /** Numbers the opponent is known not to hold (he drew or passed on them). */
  clue: Pip[]
}

export const newGame = (): Game => ({
  tiles: emptyTiles(),
  ends: [null, null],
  oppHand: 7,
  clue: [],
})

/** Unseen tiles minus the opponent's hand. */
export const boneyard = (g: Game) =>
  countByState(g.tiles, 'unknown') - g.oppHand

export const openEnds = (ends: [End, End]): Pip[] =>
  [...new Set(ends.filter((e): e is Pip => e !== null))].sort((a, b) => a - b)

const sortedSet = (ns: Pip[]) => [...new Set(ns)].sort((a, b) => a - b)

export type Action =
  | { type: 'step'; id: TileId; dir: 1 | -1 }
  | { type: 'toggleEnd'; side: 0 | 1; value: Pip }
  | { type: 'setOppHand'; value: number }
  | { type: 'oppDrew' }
  | { type: 'removeClue'; n: Pip }
  | { type: 'reset' }

export function reducer(g: Game, a: Action): Game {
  switch (a.type) {
    case 'step': {
      const s = g.tiles[a.id]
      const next = a.dir === 1 ? nextState(s) : prevState(s)
      return { ...g, tiles: { ...g.tiles, [a.id]: next } }
    }
    case 'toggleEnd': {
      const ends: Game['ends'] = [...g.ends]
      ends[a.side] = ends[a.side] === a.value ? null : a.value
      return { ...g, ends }
    }
    case 'setOppHand':
      return { ...g, oppHand: Math.max(0, Math.min(28, a.value)) }
    case 'oppDrew': {
      const nums = openEnds(g.ends)
      if (!nums.length) return g
      // He keeps drawing until he can play, so every tile he kept also lacks
      // these numbers. A later draw on other ends may bring old numbers back,
      // so the clue is replaced; a pass (empty boneyard) brings nothing new,
      // so it is merged.
      const clue = boneyard(g) > 0 ? nums : sortedSet([...g.clue, ...nums])
      return { ...g, clue }
    }
    case 'removeClue':
      return { ...g, clue: g.clue.filter((n) => n !== a.n) }
    case 'reset':
      return newGame()
  }
}

const isPip = (x: unknown): x is Pip =>
  Number.isInteger(x) && (x as number) >= 0 && (x as number) <= 6

/** Rebuild a game from saved JSON, keeping only valid fields. */
export function parseGame(raw: string | null): Game {
  const g = newGame()
  try {
    const s = JSON.parse(raw ?? 'null')
    if (!s || typeof s !== 'object') return g
    for (const id of ALL_TILES) {
      const t = s.tiles?.[id]
      if (t === 'arthur' || t === 'table') g.tiles[id] = t
    }
    if (Array.isArray(s.ends) && s.ends.length === 2)
      g.ends = [isPip(s.ends[0]) ? s.ends[0] : null, isPip(s.ends[1]) ? s.ends[1] : null]
    if (Number.isInteger(s.oppHand))
      g.oppHand = Math.max(0, Math.min(28, s.oppHand))
    if (Array.isArray(s.clue)) g.clue = sortedSet(s.clue.filter(isPip))
  } catch {
    // Corrupt save: start fresh.
  }
  return g
}
