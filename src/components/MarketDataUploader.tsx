import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { MarketOrder } from '../types/MarketOrder';

interface MarketDataUploaderProps {
  onDataUploaded: (data: MarketOrder[]) => void;
}

const MarketDataUploader: React.FC<MarketDataUploaderProps> = ({ onDataUploaded }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json) && json.every(item => 'order_id' in item)) {
          onDataUploaded(json);
          setError(null);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        setError('Error parsing JSON file. Please ensure it\'s in the correct format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mb-6">
      <label htmlFor="market-data" className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
        <Upload className="mr-2" />
        <span>Upload Market Data JSON</span>
        <input id="market-data" type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
      </label>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default MarketDataUploader;