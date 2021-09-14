import React from 'react';
import { Book, Pair } from '../../core/models';
import './BestPrice.css';

interface BestPriceProps {
  pair?: Pair
  bookData: Book
}

const BestPrice = ({ pair, bookData }: BestPriceProps) => {
  let bestBid, bestAsk, spread
  if (bookData.bids?.length > 0 && bookData.asks?.length > 0) {
    [ bestBid ] = bookData.bids[0];
    [ bestAsk ] = bookData.asks[0];
    spread = (parseFloat(bestAsk) - parseFloat(bestBid)).toFixed(pair?.quoteRounding ?? 2)
  }

  return (
    <table className="bookBestPrice table">
      <thead>
        <tr>
          <th colSpan={4}>Best Price</th>
        </tr>
        <tr>
          <td>Pair</td>
          <td>Bid</td>
          <td>Ask</td>
          <td>Spread</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{ pair?.name }</td>
          <td>{ Number(bestBid).toFixed(pair?.quoteRounding ?? 2) }</td>
          <td>{ Number(bestAsk).toFixed(pair?.quoteRounding ?? 2) }</td>
          <td>{ spread }</td>
        </tr>
      </tbody>
    </table>
  )
}

export default BestPrice