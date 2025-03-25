import React from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { TournamentData, Level, Chips, Prizes } from './SettingsPage';

const TournamentPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as { tournamentData: TournamentData } | null;
    
    if (!state?.tournamentData) {
        return <div>No tournament data available</div>;
    }

    const { players, buyIn, totalPrizePool, startStack, prizeDistribution, chips, levels } = state.tournamentData;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <button 
                    onClick={() => navigate('/')}
                    className="cs-btn bg-gray-600 hover:bg-gray-700"
                >
                    Back to Settings
                </button>
                <h1 className="poker-header">Tournament in Progress</h1>
            </div>
            
            <div className="grid-container">
                <div className="grid-item">
                    <h2>Tournament Info</h2>
                    <div className="pt-3">
                        <p>Players: {players}</p>
                        <p>Buy-in: {buyIn}</p>
                        <p>Total Prize Pool: {totalPrizePool}</p>
                        <p>Starting Stack: {startStack}</p>
                    </div>
                </div>

                <div className="grid-item">
                    <h2>Prize Distribution</h2>
                    <div className="pt-3">
                        {prizeDistribution.map((prize, index) => (
                            <div key={index} className="price-box">
                                {index === 0 && '🥇'}
                                {index === 1 && '🥈'}
                                {index === 2 && '🥉'}
                                {index > 2 && `${index + 1}:th`}
                                <span>{prize.prize}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid-item">
                    <h2>Chips</h2>
                    <div className="pt-3">
                        {chips.map((chip, index) => (
                            <div key={index} className="chip-display">
                                <img
                                    className="size-8"
                                    src={`../src/assets/marker_${chip.color}.png`}
                                    alt={`${chip.color} poker chip`}
                                />
                                <span>{chip.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid-item">
                    <h2>Levels</h2>
                    <div className="pt-3">
                        <table>
                            <thead>
                                <tr>
                                    <th>Level</th>
                                    <th>Small</th>
                                    <th>Big</th>
                                    <th>Time (min)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {levels.map((level) => (
                                    <tr key={level.id}>
                                        <td>{level.isBreak ? "Break" : level.level}</td>
                                        <td>{level.isBreak ? "Break" : level.small}</td>
                                        <td>{level.isBreak ? "Break" : level.big}</td>
                                        <td>{level.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentPage;
