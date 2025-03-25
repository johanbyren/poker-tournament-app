import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { TournamentData, Level, Chips, Prizes } from './SettingsPage';

const TournamentPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as { tournamentData: TournamentData } | null;
    
    // Timer and level state
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);
    
    if (!state?.tournamentData) {
        return <div>No tournament data available</div>;
    }

    const { players, buyIn, totalPrizePool, startStack, prizeDistribution, chips, levels } = state.tournamentData;
    
    // Initialize timer with first level's time
    useEffect(() => {
        setTimeLeft(levels[0].time * 60); // Convert minutes to seconds
    }, []);

    // Timer effect
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        // Time's up, stop timer and start blinking
                        setIsRunning(false);
                        setIsBlinking(true);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        if (timeLeft === 0) {
            // Move to next level and reset timer
            if (currentLevelIndex < levels.length - 1) {
                const nextIndex = currentLevelIndex + 1;
                setCurrentLevelIndex(nextIndex);
                setTimeLeft(levels[nextIndex].time * 60);
                setIsBlinking(false);
            }
        }
        setIsRunning(!isRunning);
    };

    const currentLevel = levels[currentLevelIndex];
    const nextLevel = currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : null;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4 px-4">
                <button 
                    onClick={() => navigate('/')}
                    className="cs-btn px-6 py-2"
                >
                    Back to Settings
                </button>
                <h1 className="poker-header">Tournament in Progress</h1>
            </div>
            
            <div className="grid-container">
                <div className={`grid-item col-span-full ${isBlinking ? 'animate-blink bg-red-900' : 'bg-gray-800'}`}>
                    <div className="flex items-center py-8">
                        {/* Tournament Info - Left Side */}
                        <div className="w-1/3 px-8">
                            <h2 className="text-2xl font-bold mb-4 text-white">Tournament Info</h2>
                            <div className="space-y-2 text-white">
                                <p className="text-xl">Players: {players}</p>
                                <p className="text-xl">Buy-in: {buyIn}</p>
                                <p className="text-xl">Total Prize Pool: {totalPrizePool}</p>
                                <p className="text-xl">Starting Stack: {startStack}</p>
                            </div>
                        </div>

                        {/* Timer Section - Center */}
                        <div className="w-1/3 flex flex-col items-center justify-center">
                            <div className="text-4xl font-bold mb-4 text-white">
                                LEVEL {currentLevel.isBreak ? "BREAK" : currentLevel.level}
                            </div>
                            <div className="text-3xl mb-6 text-white">
                                BLINDS: {currentLevel.isBreak ? "BREAK" : `${currentLevel.small}/${currentLevel.big}`}
                            </div>
                            <div className="text-5xl font-mono mb-8 text-white">
                                {formatTime(timeLeft)}
                            </div>
                            <button 
                                onClick={toggleTimer}
                                className={`cs-btn ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} px-8 py-4 text-xl`}
                            >
                                {timeLeft === 0 && nextLevel 
                                    ? `Start Level ${nextLevel.isBreak ? "BREAK" : nextLevel.level}`
                                    : isRunning ? 'Stop' : 'Start'}
                            </button>
                        </div>

                        {/* Empty div for spacing */}
                        <div className="w-1/3"></div>
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
                        <div className="chips-container">
                            {[...chips]
                                .sort((a, b) => a.value - b.value)
                                .map((chip, index) => (
                                    <div key={index} className="chip-display">
                                        <img
                                            className="size-8"
                                            src={`../src/assets/marker_${chip.color}.png`}
                                            alt={`${chip.color} poker chip`}
                                        />
                                        <span className="text-sm">{chip.value}</span>
                                    </div>
                                ))}
                        </div>
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
