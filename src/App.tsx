import React, { useEffect, useState } from 'react'
import TradingViewWidget, { Themes } from 'react-tradingview-widget'
import { Book, Pair } from './core/models'
import { coinbaseService, CoinbaseService } from './core/service'
import { BestPrice, OrderBook } from './components'
import './App.css';
import pairs from './core/data/pairs.json'

let service: CoinbaseService, 
    socket: WebSocket | undefined, 
    lastPair: string,
    book: Book,
    throttle = {
      lastThrottleTime: 0,
      time: 250
    }

const App = () => {
  const [bookPair, setBookPair] = useState<string>('')
  const [bookPairData, setBookPairData] = useState<Pair>()
  const [bookDisplayData, setBookDisplayData] = useState<Book>({
    asks: [],
    bids: []
  })

  const onBookPairSelectionChange = (ev: { target: { value: string } }) => {
    setBookPair(ev.target.value)
    setBookPairData(pairs.find(pair => pair.name === ev.target.value))
  }
    

  useEffect(() => {
    service = coinbaseService()
  }, [])

  useEffect(() => {
    if (socket) {
      service.unsubscribe(lastPair)
      
      if (bookPair !== '') service.subscribe(bookPair)
      else {
        service.disconnect()
        socket = undefined
      }
    }
    else if (bookPair && bookPair !== '') {
      socket = service.connect(bookPair)
      socket.onmessage = (event) => {
        book = service.setUpdates(event, book)

        const currentTime = Date.now()
        if (currentTime - throttle.lastThrottleTime > throttle.time) {
          if (book.asks && book.bids) setBookDisplayData({
            asks: book.asks.slice(0,500),
            bids: book.bids.slice(0,500)
          })
          throttle.lastThrottleTime = currentTime
        }
      }
    }
    lastPair = bookPair
  }, [bookPair])

  return (
    <div className="App">
      <select 
        className="bookSelector" name="book" onChange={onBookPairSelectionChange}>
        <option value="">-- Pair Selection --</option>
        {
          pairs.map((pair, i) => <option key={i}>{ pair.name }</option>)
        }
      </select>

      { bookPair !== '' ? 
        <div className="bookDashboard">
          <BestPrice pair={bookPairData} bookData={bookDisplayData} /> 

          <div className="bookChart">
            <TradingViewWidget
              symbol={`COINBASE:${bookPair.replace('-','')}`}
              theme={Themes.DARK}
              locale="en"
              interval={1}
              autosize
            />
          </div>

          <OrderBook pair={bookPairData} bookData={bookDisplayData} />

        </div>
        : null
      }
    </div>
  );
}

export default App;
