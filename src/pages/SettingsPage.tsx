import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const [playerCount, setPlayerCount] = useState(8); // Changed default value to 8
  const navigate = useNavigate();

  const handleStartTournament = () => {
    navigate('/tournamentPage', { state: { playerCount } });
  };

  return (
    <div>
      <h1>Tournament Settings</h1>
      <label htmlFor="playerCount">Number of Players:</label>
      <input
        type="number"
        id="playerCount"
        value={playerCount}
        onChange={(e) => setPlayerCount(parseInt(e.target.value, 10) || 0)}
        min="2" // Minimum 2 players
      />
      <button onClick={handleStartTournament}>Start Tournament</button>
    </div>
  );
};

export default SettingsPage;
