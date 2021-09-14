import { Book, SocketMessageEvent } from "./models";

interface CoinbaseService {
  connect: (ticker: string) => WebSocket; 
  subscribe: (ticker: string) => void; 
  unsubscribe: (ticker: string) => void; 
  disconnect: () => void;
  setUpdates: (event: SocketMessageEvent, bookData: Book) => Book;
}

const coinbaseService = () => {
  let ws: WebSocket;

  const connect = (ticker: string) => {
    console.log('Socket Connecting...')
    ws = new WebSocket('wss://ws-feed.pro.coinbase.com')
    ws.onopen = () => subscribe(ticker)
    return ws
  }

  const subscribe = (ticker: string) => {
    ws.send(JSON.stringify({
      type: 'subscribe',
      product_ids: [ticker],
      channels: ['level2']
    }))
  }

  const unsubscribe = (ticker: string) => {
    ws.send(JSON.stringify({
      type: 'unsubscribe',
      product_ids: [ticker],
      channels: ['level2']
    }))
  }

  const disconnect = () => {
    ws.close()
    console.log('Socket Disconnected.')
  }

  const setUpdates = (event: SocketMessageEvent, bookData: Book) => {
    if (JSON.parse(event.data)?.type === "snapshot") {
      const { asks, bids } = JSON.parse(event.data)
      const createBook: Book = {
        bids: bids,
        asks: asks
      }
      return createBook
    }

    if (JSON.parse(event.data)?.type === "l2update") {
      // console.log('UPDATE', JSON.parse(event.data).changes)
      const changes: Array<[string, string, string]> = JSON.parse(event.data).changes

      const createBook: Book = { ...bookData }

      changes.forEach(([side, price, size]) => {
        const floatPrice = parseFloat(price)
        const floatSize = parseFloat(size)
        
        if (side === 'buy') {
          for (let i = 0; i < createBook.bids.length; i++) {
            const floatBookPrice = parseFloat(createBook.bids[i][0])
            if (floatPrice === floatBookPrice && floatSize === 0) {
              createBook.bids.splice(i, 1)
              break
            }
            else if (floatPrice === floatBookPrice && floatSize !== 0) {
              createBook.bids[i][1] = size
              break
            }
            else if (floatPrice > floatBookPrice && floatSize !== 0) {
              createBook.bids.splice(i, 0, [price, size])
              break
            }
          }
        } else {
          for (let i = 0; i < createBook.asks.length; i++) {
            const floatBookPrice = parseFloat(createBook.asks[i][0])
            if (floatPrice === floatBookPrice && floatSize === 0) {
              createBook.asks.splice(i, 1)
              break
            }
            else if (floatPrice === floatBookPrice && floatSize !== 0) {
              createBook.asks[i][1] = size
              break
            }
            else if (floatPrice < floatBookPrice && floatSize !== 0) {
              createBook.asks.splice(i, 0, [price, size])
              break
            }
          }
        }
      })

      return createBook
    }

    return {
      asks: [],
      bids: []
    }
  }

  return {
    connect,
    subscribe,
    unsubscribe,
    disconnect,
    setUpdates
  }
}

export {
  coinbaseService
}

export type {
  CoinbaseService
}