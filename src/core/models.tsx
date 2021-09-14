interface Pair {
  name: string
  baseRounding: number
  baseRoundingDecimal: number
  quoteRounding: number
  quoteRoundingDecimal: number
}

interface Book {
  asks: string[][]
  bids: string[][]
}

interface SocketMessageEvent {
  data: string
}

export type {
  Book,
  Pair,
  SocketMessageEvent
}