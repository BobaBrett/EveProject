import React, { useMemo } from 'react';
import { MarketOrder } from '../types/MarketOrder';

interface MarketAnalysisProps {
  orders: MarketOrder[];
}

const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ orders }) => {
  const analysis = useMemo(() => {
    const buyOrders = orders.filter(order => order.is_buy_order);
    const sellOrders = orders.filter(order => !order.is_buy_order);

    const potentialTrades = buyOrders.flatMap(buyOrder =>
      sellOrders
        .filter(sellOrder => sellOrder.type_id === buyOrder.type_id && sellOrder.price < buyOrder.price)
        .map(sellOrder => ({
          typeId: buyOrder.type_id,
          profit: buyOrder.price - sellOrder.price,
          buyPrice: buyOrder.price,
          sellPrice: sellOrder.price,
          volume: Math.min(buyOrder.volume_remain, sellOrder.volume_remain),
        }))
    ).sort((a, b) => b.profit - a.profit);

    return {
      totalOrders: orders.length,
      buyOrders: buyOrders.length,
      sellOrders: sellOrders.length,
      potentialTrades: potentialTrades.slice(0, 10), // Top 10 potential trades
    };
  }, [orders]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Market Analysis</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-lg font-semibold">Total Orders</p>
          <p className="text-3xl font-bold">{analysis.totalOrders}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-lg font-semibold">Buy Orders</p>
          <p className="text-3xl font-bold">{analysis.buyOrders}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-lg font-semibold">Sell Orders</p>
          <p className="text-3xl font-bold">{analysis.sellOrders}</p>
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">Top Potential Trades</h3>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Type ID</th>
            <th className="p-2 text-left">Profit</th>
            <th className="p-2 text-left">Buy Price</th>
            <th className="p-2 text-left">Sell Price</th>
            <th className="p-2 text-left">Volume</th>
          </tr>
        </thead>
        <tbody>
          {analysis.potentialTrades.map((trade, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="p-2">{trade.typeId}</td>
              <td className="p-2 text-green-600">{trade.profit.toLocaleString()} ISK</td>
              <td className="p-2">{trade.buyPrice.toLocaleString()} ISK</td>
              <td className="p-2">{trade.sellPrice.toLocaleString()} ISK</td>
              <td className="p-2">{trade.volume}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarketAnalysis;