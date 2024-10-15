import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Rocket } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [characterData, setCharacterData] = useState(null);
  const [characterID, setCharacterID] = useState(null);

  useEffect(() => {
    const fetchCharacterID = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/character-id', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`, // Use the stored access token
          },
        });
        setCharacterID(response.data.characterID);
      } catch (error) {
        console.error('Error fetching character ID:', error);
      }
    };

    fetchCharacterID();
  }, []);

  useEffect(() => {
    if (characterID) {
      const fetchCharacterData = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/api/esi/characters/${characterID}/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`, // Use the stored access token
            },
          });
          setCharacterData(response.data);
        } catch (error) {
          console.error('Error fetching character data:', error);
        }
      };
      
      fetchCharacterData();
    }
  }, [characterID]);

  if (!characterData) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">EVE Online Dashboard</h1>
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-center mb-4">
          <User size={24} className="mr-2" />
          <h2 className="text-2xl font-semibold">{characterData[0].name}</h2>
        </div>
        <p className="mb-2">Corporation: {characterData[0].corporation_id}</p>
        <p>Alliance: {characterData[0].alliance_id || 'N/A'}</p>
      </div>
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Character Attributes</h3>
        <ul>
          {Object.entries(characterData[0]).map(([key, value]) => (
            <li key={key} className="mb-2">
              <strong>{key}:</strong> {value}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Rocket size={20} className="mr-2" />
            Skills
          </h3>
          {/* Add skill information here */}
          <p>Skill information coming soon...</p>
        </div>
        {/* Add more dashboard widgets here */}
      </div>
    </div>
  );
};

export default Dashboard;