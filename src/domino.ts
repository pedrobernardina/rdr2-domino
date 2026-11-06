export type Pip = 0 | 1 | 2 | 3 | 4 | 5 | 6
export const PIPS: Pip[] = [0, 1, 2, 3, 4, 5, 6]

/** Where a tile is, as far as Arthur knows. */
export type TileState = 'unknown' | 'arthur' | 'table'
const ORDER: TileState[] = ['unknown', 'arthur', 'table']

/** Canonical id with the lower number first, e.g. "3-5". */
export type TileId = `${Pip}-${Pip}`
export const tileId = (a: Pip, b: Pip): TileId =>
  (a <= b ? `${a}-${b}` : `${b}-${a}`) as TileId

export const ALL_TILES: TileId[] = PIPS.flatMap((a) =>
  PIPS.filter((b) => b >= a).map((b) => tileId(a, b)),
)

export const pipsOf = (id: TileId): [Pip, Pip] =>
  id.split('-').map(Number) as [Pip, Pip]

export const nextState = (s: TileState) => ORDER[(ORDER.indexOf(s) + 1) % 3]
export const prevState = (s: TileState) => ORDER[(ORDER.indexOf(s) + 2) % 3]

export type Tiles = Record<TileId, TileState>
export const emptyTiles = (): Tiles =>
  Object.fromEntries(ALL_TILES.map((id) => [id, 'unknown'])) as Tiles

/** How many tiles carrying `n` are still unaccounted for (opponent or boneyard). */
export const unknownWith = (tiles: Tiles, n: Pip) =>
  ALL_TILES.filter((id) => pipsOf(id).includes(n) && tiles[id] === 'unknown')
    .length

export const countByState = (tiles: Tiles, s: TileState) =>
  ALL_TILES.filter((id) => tiles[id] === s).length

export const isDouble = (id: TileId) => {
  const [a, b] = pipsOf(id)
  return a === b
}
export const pipSum = (id: TileId) => pipsOf(id)[0] + pipsOf(id)[1]
