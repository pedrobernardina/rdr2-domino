import { ALL_TILES, pipsOf, type Pip, type TileId } from './domino'
import type { Game } from './game'

/**
 * The opponent's hand, modelled as a uniform random pick of `hand` tiles from
 * `pool`: the unseen tiles that don't break the clue.
 */
export type OppModel = { pool: TileId[]; hand: number; overflow: boolean }

export function oppModel(g: Game): OppModel {
  const pool = ALL_TILES.filter(
    (id) =>
      g.tiles[id] === 'unknown' && !pipsOf(id).some((n) => g.clue.includes(n)),
  )
  return {
    pool,
    hand: Math.min(g.oppHand, pool.length),
    overflow: g.oppHand > pool.length,
  }
}

/** Chance that none of his tiles matches `hit`. */
export function pNone(m: OppModel, hit: (id: TileId) => boolean) {
  const total = m.pool.length
  const safe = m.pool.filter((id) => !hit(id)).length
  let p = 1
  for (let i = 0; i < m.hand; i++) p *= Math.max(0, safe - i) / (total - i)
  return p
}

export const pHasNumber = (m: OppModel, n: Pip) =>
  1 - pNone(m, (id) => pipsOf(id).includes(n))

/** Chance he has no tile for any of these open ends. */
export const pCannotPlay = (m: OppModel, ends: Pip[]) =>
  pNone(m, (id) => pipsOf(id).some((n) => ends.includes(n)))

export const pct = (p: number) => `${Math.round(p * 100)}%`
