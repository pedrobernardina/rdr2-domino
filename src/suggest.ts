import {
  ALL_TILES,
  isDouble,
  pipsOf,
  pipSum,
  type Pip,
  type TileId,
} from './domino'
import { boneyard, openEnds, type Game } from './game'
import { oppModel, pCannotPlay, type OppModel } from './odds'

/** Why a move is good or bad; each language renders its own sentence. */
export type ReasonData =
  | { kind: 'win' }
  | { kind: 'blocked'; ends: Pip[]; pass: boolean }
  | { kind: 'surePlay' }
  | { kind: 'blockChance'; p: number; pass: boolean }
  | { kind: 'follow'; n: number }
  | { kind: 'noFollow' }
  | { kind: 'shed'; pips: number }
  | { kind: 'double' }

export type Reason = ReasonData & { tone: 'good' | 'bad' | 'info' }

export type Move = {
  tile: TileId
  /** The end number it is played on; null for the opening tile. */
  on: Pip | null
  /** The number left open by this tile. */
  out: Pip
  ends: [Pip, Pip]
  score: number
  reasons: Reason[]
}

export type Advice =
  | { kind: 'noHand' }
  | { kind: 'needEnds' }
  | { kind: 'stuck'; ends: Pip[]; boneyard: number }
  | { kind: 'moves'; opening: boolean; moves: Move[] }

// Priority: block him > keep a follow-up > shed pips > play doubles early.
const W = { block: 100, follow: 20, extraFollow: 3, pip: 1.2, double: 5 }

function shedReasons(tile: TileId): Reason[] {
  const r: Reason[] = [{ kind: 'shed', pips: pipSum(tile), tone: 'info' }]
  if (isDouble(tile)) r.push({ kind: 'double', tone: 'good' })
  return r
}

const shedScore = (tile: TileId) =>
  pipSum(tile) * W.pip + (isDouble(tile) ? W.double : 0)

function openingMove(tile: TileId): Move {
  const [x, y] = pipsOf(tile)
  return {
    tile,
    on: null,
    out: y,
    ends: [x, y],
    score: shedScore(tile),
    reasons: shedReasons(tile),
  }
}

function playMove(
  tile: TileId,
  on: Pip,
  ends: [Pip, Pip],
  hand: TileId[],
  model: OppModel,
  bone: number,
): Move {
  const [x, y] = pipsOf(tile)
  const out = x === on ? y : x
  const base = { tile, on, out, ends }
  const rest = hand.filter((t) => t !== tile)
  if (!rest.length)
    return { ...base, score: 1000, reasons: [{ kind: 'win', tone: 'good' }] }

  const open = openEnds(ends)
  const block = pCannotPlay(model, open)
  const follow = rest.filter((t) => pipsOf(t).some((n) => open.includes(n))).length
  const pass = bone <= 0

  const reasons: Reason[] = []
  if (block > 0.995) reasons.push({ kind: 'blocked', ends: open, pass, tone: 'good' })
  else if (block < 0.005) reasons.push({ kind: 'surePlay', tone: 'bad' })
  else
    reasons.push({
      kind: 'blockChance',
      p: block,
      pass,
      tone: block >= 0.5 ? 'good' : block < 0.2 ? 'bad' : 'info',
    })
  reasons.push(
    follow
      ? { kind: 'follow', n: follow, tone: 'good' }
      : { kind: 'noFollow', tone: 'bad' },
  )
  reasons.push(...shedReasons(tile))

  const score =
    block * W.block +
    (follow ? W.follow + W.extraFollow * Math.min(follow - 1, 2) : 0) +
    shedScore(tile)
  return { ...base, score, reasons }
}

const byScore = (moves: Move[]) => moves.sort((a, b) => b.score - a.score)

export function advise(g: Game): Advice {
  const hand = ALL_TILES.filter((id) => g.tiles[id] === 'arthur')
  if (!hand.length) return { kind: 'noHand' }

  const [a, b] = g.ends
  if (a === null && b === null)
    return { kind: 'moves', opening: true, moves: byScore(hand.map(openingMove)) }
  if (a === null || b === null) return { kind: 'needEnds' }

  const model = oppModel(g)
  const bone = boneyard(g)
  const moves: Move[] = []
  const sides: (0 | 1)[] = a === b ? [0] : [0, 1]
  for (const side of sides) {
    const on = g.ends[side] as Pip
    for (const tile of hand) {
      const [x, y] = pipsOf(tile)
      if (x !== on && y !== on) continue
      const out = x === on ? y : x
      const ends: [Pip, Pip] = side === 0 ? [out, b] : [a, out]
      moves.push(playMove(tile, on, ends, hand, model, bone))
    }
  }
  if (!moves.length)
    return { kind: 'stuck', ends: openEnds(g.ends), boneyard: Math.max(0, bone) }
  return { kind: 'moves', opening: false, moves: byScore(moves) }
}
