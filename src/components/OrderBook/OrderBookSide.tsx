import React from 'react';
import { Pair } from '../../core/models';
import { OrderBookProps } from './OrderBook';

enum SideOptions {
  ASKS = 'asks',
  BIDS = 'bids'
}

interface OrderBookSideProps {
  pair?: Pair
  side: SideOptions
  data: string[][]
  sizeMax: number
  options: OrderBookProps["options"]
}

const OrderBookSide = ({
    pair,
    side,
    data,
    sizeMax,
    options
  }: OrderBookSideProps) => {
  
  return (
    <tbody className={side}>
      { data.map(([price, size], index) => 
        <tr key={index}>
          <td>
            <div className="size" style={{width: ((parseFloat(size) / sizeMax) * options!.sizeBase)+'px'}}></div>
          </td>
          <td>{ Number(size).toFixed(pair?.baseRounding ?? 2) }</td>
          <td>{ Number(price).toFixed(pair?.quoteRounding ?? 2) }</td>
        </tr>
      )}
    </tbody>
  )
}

export default OrderBookSide

export {
  SideOptions,
}