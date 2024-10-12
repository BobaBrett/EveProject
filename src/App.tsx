import React, { useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';
import MarketAnalysis from './components/MarketAnalysis';
import { MarketOrder } from './types/MarketOrder';
import AdminPage from './components/AdminPage';

function App() {
  const [marketData, setMarketData] = useState<MarketOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchLatestMarketData();
  }, []);

  const fetchLatestMarketData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/market-data');
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }
      const data = await response.json();
      setMarketData(data);
    } catch (err) {
      setError('Error fetching market data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center">
            <Rocket className="mr-2" />
            Eve Online Market Browser
          </h1>
          <p className="text-gray-600 mt-2">
            View the latest market data
          </p>
        </header>
        <div className="mb-6">
          <button
            onClick={fetchLatestMarketData}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-4"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Fetch Latest Market Data'}
          </button>
          <button
            onClick={() => setIsAdmin(true)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Admin Page
          </button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {isAdmin ? (
          <AdminPage onClose={() => setIsAdmin(false)} />
        ) : (
          marketData.length > 0 && <MarketAnalysis orders={marketData} />
        )}
      </div>
    </div>
  );
}

export default App;