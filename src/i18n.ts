import type { Pip, TileState } from './domino'
import { pct } from './odds'
import type { ReasonData } from './suggest'

export type Lang = 'pt' | 'en'
export const LANGS: Lang[] = ['pt', 'en']

const pt = {
  htmlLang: 'pt-BR',
  title: 'Dominó · contagem',
  pageTitle: 'Dominó · RDR2',
  langName: 'Português',
  newRound: 'Nova rodada',
  confirmReset: 'Zerar peças, pontas, mão e pista?',
  yesReset: 'Sim, zerar',
  cancel: 'Cancelar',
  state: { unknown: 'Desconhecida', arthur: 'Arthur', table: 'Mesa' } as Record<TileState, string>,
  tileState: {
    unknown: 'desconhecida',
    arthur: 'com o Arthur',
    table: 'na mesa',
  } as Record<TileState, string>,
  hint: 'Clique: desconhecida → Arthur → Mesa · Clique direito: volta · Mouse num número: destaca as peças dele',
  unknownWord: (n: number): string => (n === 1 ? 'desconhecida' : 'desconhecidas'),
  allSeen: 'todas vistas',
  clued: 'ele NÃO tem',
  none: 'ele não tem',
  has: (p: number) => `${pct(p)} ele tem`,
  endsTitle: 'Pontas da mesa',
  endPick: (side: string, n: Pip) => `Ponta ${side}: ${n}`,
  clickToClear: 'Clique de novo para limpar',
  oppHand: 'Mão do oponente',
  boneyard: (n: number) => `Monte: ${n}`,
  oppDrew: 'Oponente comprou',
  oppPassed: 'Oponente passou',
  clue: 'Ele não tem:',
  removeClue: 'Remover da pista',
  overflow: (hand: number, pool: number) =>
    `A mão dele (${hand}) não cabe nas ${pool} peças que ele pode ter. Confira as marcações, a pista ou o número da mão.`,
  suggestion: 'Sugestão',
  noHand: 'Marque suas peças (clique nelas) para ver sugestões.',
  needEnds: 'Escolha as duas pontas (A e B).',
  draw: 'Compre do monte',
  pass: 'Passe a vez',
  nothingFits: (ends: Pip[]) => `Nenhuma peça sua encaixa em ${ends.join(' ou ')}.`,
  lead: (name: string) => `Saia com ${name}`,
  leadSub: (a: Pip, b: Pip) => `pontas ${a} e ${b}`,
  play: (name: string, on: Pip) => `Jogue ${name} na ponta ${on}`,
  playSub: (a: Pip, b: Pip) => `pontas ficam ${a} e ${b}`,
  reason: (r: ReasonData): string => {
    switch (r.kind) {
      case 'win':
        return 'você bate!'
      case 'blocked':
        return `ele não tem ${r.ends.join(' nem ')}: vai ${r.pass ? 'passar' : 'comprar'}`
      case 'surePlay':
        return 'ele com certeza consegue jogar'
      case 'blockChance':
        return `${pct(r.p)} de chance de ele ter que ${r.pass ? 'passar' : 'comprar'}`
      case 'follow':
        return `você ainda tem ${r.n} jogada${r.n === 1 ? '' : 's'} nessas pontas`
      case 'noFollow':
        return 'você fica sem jogada nessas pontas'
      case 'shed':
        return `livra ${r.pips} pontos`
      case 'double':
        return 'dobrada: difícil de encaixar depois'
    }
  },
}

export type Strings = typeof pt

const en: Strings = {
  htmlLang: 'en',
  title: 'Dominoes · tracker',
  pageTitle: 'Dominoes · RDR2',
  langName: 'English',
  newRound: 'New round',
  confirmReset: 'Reset tiles, ends, hand and clue?',
  yesReset: 'Yes, reset',
  cancel: 'Cancel',
  state: { unknown: 'Unknown', arthur: 'Arthur', table: 'Table' },
  tileState: { unknown: 'unknown', arthur: "Arthur's", table: 'on the table' },
  hint: 'Click: unknown → Arthur → Table · Right-click: back · Hover a number: highlights its tiles',
  unknownWord: () => 'unknown',
  allSeen: 'all seen',
  clued: 'he does NOT have',
  none: 'he has none',
  has: (p) => `${pct(p)} he has one`,
  endsTitle: 'Open ends',
  endPick: (side, n) => `End ${side}: ${n}`,
  clickToClear: 'Click again to clear',
  oppHand: "Opponent's hand",
  boneyard: (n) => `Boneyard: ${n}`,
  oppDrew: 'Opponent drew',
  oppPassed: 'Opponent passed',
  clue: 'He has no:',
  removeClue: 'Remove from clue',
  overflow: (hand, pool) =>
    `His hand (${hand}) doesn't fit in the ${pool} tiles he could hold. Check your marks, the clue or the hand count.`,
  suggestion: 'Suggestion',
  noHand: 'Mark your tiles (click them) to see suggestions.',
  needEnds: 'Pick both ends (A and B).',
  draw: 'Draw from the boneyard',
  pass: 'Pass',
  nothingFits: (ends) => `None of your tiles fits ${ends.join(' or ')}.`,
  lead: (name) => `Lead with ${name}`,
  leadSub: (a, b) => `ends ${a} and ${b}`,
  play: (name, on) => `Play ${name} on the ${on}`,
  playSub: (a, b) => `ends become ${a} and ${b}`,
  reason: (r) => {
    switch (r.kind) {
      case 'win':
        return 'you go out!'
      case 'blocked':
        return `he has no ${r.ends.join(' or ')}: he must ${r.pass ? 'pass' : 'draw'}`
      case 'surePlay':
        return 'he can certainly play'
      case 'blockChance':
        return `${pct(r.p)} chance he must ${r.pass ? 'pass' : 'draw'}`
      case 'follow':
        return `you still have ${r.n} play${r.n === 1 ? '' : 's'} on these ends`
      case 'noFollow':
        return "you'll have no play on these ends"
      case 'shed':
        return `sheds ${r.pips} points`
      case 'double':
        return 'double: hard to place later'
    }
  },
}

export const STRINGS: Record<Lang, Strings> = { pt, en }

const isLang = (x: unknown): x is Lang => LANGS.includes(x as Lang)

/** Saved choice first, then the browser language. */
export function initialLang(saved: string | null, browser: string): Lang {
  if (isLang(saved)) return saved
  return browser.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}
