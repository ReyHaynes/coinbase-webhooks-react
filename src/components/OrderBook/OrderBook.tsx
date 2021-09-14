import React, { useState } from 'react';
import { Book, Pair } from '../../core/models';
import OrderBookSide, { SideOptions } from './OrderBookSide';
import './OrderBook.css'

interface OrderBookProps {
  pair?: Pair
  bookData: Book
  options?: {
    limit: number
    sizeBase: number
  }
}

enum Aggregator {
  ONE = 1,
  FIVE = 5,
  TEN = 10,
  FIFTY = 50,
  HUNDRED = 100
}

const OrderBook = ({ pair, bookData, options = { 
    limit: 10,
    sizeBase: 100
  } }: OrderBookProps) => {

  let [aggregator, setAggregator] = useState<Aggregator>(Aggregator.ONE)

  let spread,
      sizeMax: number = 0,
      asks: string[][],
      bids: string[][]

  const aggregateRound = (value: number, ceil: boolean) => {
    return Math[ceil ? 'ceil' : 'floor'](value / aggregator) * aggregator
  }

  if (aggregator === Aggregator.ONE) {
    asks = [ ...bookData.asks ].splice(0, options.limit).reverse()
    bids = [ ...bookData.bids ].splice(0, options.limit)
  } else {
    let aggregatedAsk: string[][] = [[]]
    let aggregatedBid: string[][] = [[]]

    if (bookData.asks.length > 0 && bookData.bids.length > 0) {
      [ ...bookData.asks ].map(([price, size]) => {
        const floatPrice = aggregateRound(parseFloat(price)*100, true)/100
        const floatSize = parseFloat(size)

        for (let i = 0; i < aggregatedAsk.length; i++) {
          const aPrice = parseFloat(aggregatedAsk[i][0]) || 0
          const aSize = parseFloat(aggregatedAsk[i][1])

          if (floatPrice === aPrice) {
            aggregatedAsk[i][1] = String(floatSize + aSize)
            break
          }
          else if (floatPrice > aPrice) {
            aggregatedAsk.splice(i, 0, [String(floatPrice), size])
            break
          }
        }
        return ''
      });
      
      [ ...bookData.bids ].map(([price, size]) => {
        const floatPrice = aggregateRound(parseFloat(price)*100, true)/100
        const floatSize = parseFloat(size)

        for (let i = 0; i < aggregatedBid.length; i++) {
          const aPrice = parseFloat(aggregatedBid[i][0]) || 0
          const aSize = parseFloat(aggregatedBid[i][1])

          if (floatPrice === aPrice) {
            aggregatedBid[i][1] = String(floatSize + aSize)
            break
          }
          else if (floatPrice > aPrice) {
            aggregatedBid.splice(i, 0, [String(floatPrice), size])
            break
          }
        }
        return ''
      })
    }
    asks = [ ...aggregatedAsk ].splice(0, options.limit).reverse()
    bids = [ ...aggregatedBid ].splice(0, options.limit)
  }

  if (asks[0].length > 0 && bids[0].length > 0 && pair) {
    spread = (parseFloat(bookData.asks[0][0]) - parseFloat(bookData.bids[0][0])).toFixed(pair.quoteRounding ?? 2)
    sizeMax = Math.max(
      ...bids.map(([_, size]) => parseFloat(size)),
      ...asks.map(([_, size]) => parseFloat(size))
    )
  }

  return (
    <table className="bookLevelTwo table">
      <thead>
        <tr>
          <th colSpan={3}>Order Book</th>
        </tr>
        <tr>
          <td colSpan={2}>Market Size ({ pair?.name.split('-')[0] })</td>
          <td>Price ({ pair?.name.split('-')[1] })</td>
        </tr>
      </thead>
      <OrderBookSide 
        pair={pair} side={SideOptions.ASKS} data={asks} 
        sizeMax={sizeMax} options={options} />
      <thead>
        <tr>
          <td colSpan={2}>{ pair?.name.split('-')[1] } Spread</td>
          <td>{ spread }</td>
        </tr>
      </thead>
      <OrderBookSide 
        pair={pair} side={SideOptions.BIDS}
        data={bids} sizeMax={sizeMax} options={options} />
      <thead>
        <tr>
          <td colSpan={2}>Aggregation</td>
          <td>
            { (aggregator * (pair?.quoteRoundingDecimal ?? 0.01)).toFixed(pair?.quoteRounding ?? 2) }
          </td>
        </tr>
        <tr>
          <td colSpan={3}>
            <div className="aggregator">
            {
              [Aggregator.ONE, Aggregator.FIVE, Aggregator.TEN, Aggregator.FIFTY, Aggregator.HUNDRED]
                .map((item, i) => (
                  <div key={i} className={
                    aggregator === item ? 'active' : ''
                  } onClick={() => setAggregator(item)}>{ item }</div>
                ))
            }
            </div>
          </td>
        </tr>
      </thead>
    </table>
  )
}

export default OrderBook

export type {
  OrderBookProps
}
