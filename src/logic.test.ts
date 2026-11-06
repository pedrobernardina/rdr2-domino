import { describe, expect, it } from 'vitest'
import { tileId, type Pip, type TileId, type TileState } from './domino'
import { newGame, parseGame, reducer, type Game } from './game'
import { oppModel, pHasNumber, pNone } from './odds'
import { initialLang, STRINGS } from './i18n'
import { advise, type ReasonData } from './suggest'

const t = (s: string) => tileId(Number(s[0]) as Pip, Number(s[2]) as Pip)

function game(opts: {
  arthur?: string[]
  table?: string[]
  ends?: [Pip | null, Pip | null]
  oppHand?: number
  clue?: Pip[]
}): Game {
  const g = newGame()
  const mark = (ids: string[] = [], s: TileState) =>
    ids.forEach((id) => (g.tiles[t(id)] = s))
  mark(opts.arthur, 'arthur')
  mark(opts.table, 'table')
  return { ...g, ends: opts.ends ?? g.ends, oppHand: opts.oppHand ?? 7, clue: opts.clue ?? [] }
}

/** Mark every tile except `unknown` as on the table. */
function onlyUnknown(g: Game, unknown: string[]): Game {
  const keep = new Set(unknown.map(t))
  const tiles = { ...g.tiles }
  for (const id of Object.keys(tiles) as TileId[])
    if (tiles[id] === 'unknown' && !keep.has(id)) tiles[id] = 'table'
  return { ...g, tiles }
}

describe('odds', () => {
  it('matches the hypergeometric chance', () => {
    // 4 unseen tiles, 2 carry a 6, he holds 2: P(no 6) = C(2,2)/C(4,2) = 1/6
    const g = onlyUnknown(game({ oppHand: 2 }), ['0-6', '1-6', '2-3', '2-4'])
    const m = oppModel(g)
    expect(pNone(m, (id) => id.includes('6'))).toBeCloseTo(1 / 6)
    expect(pHasNumber(m, 6)).toBeCloseTo(5 / 6)
  })

  it('a clue removes those numbers from his possible tiles', () => {
    const g = onlyUnknown(game({ oppHand: 2, clue: [6] }), ['0-6', '1-6', '2-3', '2-4'])
    expect(pHasNumber(oppModel(g), 6)).toBe(0)
    expect(pHasNumber(oppModel(g), 2)).toBe(1)
  })

  it('flags a hand bigger than the possible tiles', () => {
    const g = onlyUnknown(game({ oppHand: 3, clue: [6] }), ['0-6', '1-6', '2-3', '2-4'])
    expect(oppModel(g).overflow).toBe(true)
  })
})

describe('clue', () => {
  it('replaces the clue when he draws from the boneyard', () => {
    let g = game({ ends: [2, 5], clue: [1] })
    g = reducer(g, { type: 'oppDrew' })
    expect(g.clue).toEqual([2, 5])
  })

  it('merges the clue when he passes on an empty boneyard', () => {
    let g = onlyUnknown(game({ ends: [2, 5], clue: [1], oppHand: 3 }), ['3-3', '3-4', '4-4'])
    g = reducer(g, { type: 'oppDrew' })
    expect(g.clue).toEqual([1, 2, 5])
  })

  it('ignores the button with no ends set', () => {
    const g = game({})
    expect(reducer(g, { type: 'oppDrew' })).toBe(g)
  })
})

describe('advise', () => {
  it('asks to mark tiles first', () => {
    expect(advise(game({})).kind).toBe('noHand')
  })

  it('opens with the heaviest tile, preferring doubles', () => {
    const a = advise(game({ arthur: ['6-6', '5-6', '0-1'] }))
    expect(a.kind === 'moves' && a.moves.map((m) => m.tile)).toEqual(['6-6', '5-6', '0-1'])
  })

  it('says to draw when nothing fits', () => {
    const a = advise(game({ arthur: ['0-1'], ends: [5, 6] }))
    expect(a).toMatchObject({ kind: 'stuck', ends: [5, 6] })
  })

  it('takes the winning tile', () => {
    const a = advise(game({ arthur: ['5-6'], ends: [5, 2] }))
    expect(a.kind === 'moves' && a.moves[0].reasons[0]).toMatchObject({ kind: 'win' })
  })

  it('prefers leaving ends he is known not to hold', () => {
    // Ends 4 and 1. Playing 4-3 leaves 3|1 (he has no 3 or 1);
    // playing 4-6 leaves 6|1 (he may have a 6) even though it sheds more.
    const g = game({ arthur: ['3-4', '4-6', '1-2'], ends: [4, 1], clue: [1, 3], oppHand: 5 })
    const a = advise(g)
    if (a.kind !== 'moves') throw new Error(a.kind)
    expect(a.moves[0].tile).toBe('3-4')
    expect(a.moves[0].ends).toEqual([3, 1])
    expect(a.moves[0].reasons[0]).toMatchObject({ kind: 'blocked', ends: [1, 3], pass: false })
  })

  it('lists each end separately for a tile that fits both', () => {
    const a = advise(game({ arthur: ['2-5', '0-0'], ends: [2, 5] }))
    if (a.kind !== 'moves') throw new Error(a.kind)
    expect(a.moves.map((m) => `${m.on}>${m.ends}`).sort()).toEqual(['2>5,5', '5>2,2'])
  })

  it('does not duplicate moves when both ends match', () => {
    const a = advise(game({ arthur: ['3-6', '0-0'], ends: [3, 3] }))
    expect(a.kind === 'moves' && a.moves.length).toBe(1)
  })
})

describe('parseGame', () => {
  it('restores a saved game', () => {
    const g = reducer(game({ arthur: ['6-6'], ends: [2, 5], oppHand: 4 }), { type: 'oppDrew' })
    expect(parseGame(JSON.stringify(g))).toEqual(g)
  })

  it('reads the v1 save format', () => {
    const g = parseGame(JSON.stringify({ tiles: { '6-6': 'arthur' } }))
    expect(g.tiles['6-6']).toBe('arthur')
    expect(g.oppHand).toBe(7)
  })

  it('drops garbage', () => {
    const g = parseGame('{"tiles":{"6-6":"lol"},"ends":[9,"x"],"oppHand":"a","clue":[7,2,2]}')
    expect(g).toEqual({ ...newGame(), clue: [2] })
    expect(parseGame('not json')).toEqual(newGame())
  })
})

describe('i18n', () => {
  const blocked: ReasonData = { kind: 'blocked', ends: [1, 3], pass: false }

  it('writes reasons in each language', () => {
    expect(STRINGS.pt.reason(blocked)).toBe('ele não tem 1 nem 3: vai comprar')
    expect(STRINGS.en.reason(blocked)).toBe('he has no 1 or 3: he must draw')
    expect(STRINGS.en.reason({ kind: 'blockChance', p: 0.35, pass: true })).toBe(
      '35% chance he must pass',
    )
    expect(STRINGS.pt.reason({ kind: 'follow', n: 1 })).toBe(
      'você ainda tem 1 jogada nessas pontas',
    )
  })

  it('has every reason in both languages', () => {
    const all: ReasonData[] = [
      { kind: 'win' },
      blocked,
      { kind: 'surePlay' },
      { kind: 'blockChance', p: 0.5, pass: false },
      { kind: 'follow', n: 2 },
      { kind: 'noFollow' },
      { kind: 'shed', pips: 10 },
      { kind: 'double' },
    ]
    for (const t of Object.values(STRINGS))
      for (const r of all) expect(t.reason(r)).toMatch(/\w/)
  })

  it('picks the saved language, then the browser one', () => {
    expect(initialLang('en', 'pt-BR')).toBe('en')
    expect(initialLang(null, 'pt-BR')).toBe('pt')
    expect(initialLang('xx', 'en-US')).toBe('en')
  })
})
