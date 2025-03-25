import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { TournamentData, Level, Chips, Prizes } from './SettingsPage';

interface TimerState {
    currentLevelId: number;
    timeRemaining: number;
    isRunning: boolean;
    startTime: number | null;
}

const TournamentPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const gongSound = useRef<HTMLAudioElement>(null);
    
    // Move tournament data into state to prevent recreation on every render
    const [tournamentData, setTournamentData] = useState(() => {
        const data = location.state?.tournamentData || JSON.parse(localStorage.getItem('tournamentData') || 'null');
        if (!data) return null;
        return data;
    });

    if (!tournamentData) {
        return <div className="text-center mt-8">No tournament data available</div>;
    }

    const { players, buyIn, totalPrizePool, startStack, prizeDistribution, chips, levels } = tournamentData;
    
    // Timer and level state
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    
    // Load initial timer state - only run once on mount
    useEffect(() => {
        const savedTimerState = localStorage.getItem('timerState');
        if (savedTimerState) {
            const timerState: TimerState = JSON.parse(savedTimerState);
            const levelIndex = levels.findIndex((l: Level) => l.id === timerState.currentLevelId);
            setCurrentLevelIndex(levelIndex >= 0 ? levelIndex : 0);
            setTimeRemaining(timerState.timeRemaining);
            setIsRunning(timerState.isRunning);
            setStartTime(timerState.startTime);
        } else if (levels.length > 0) {
            setTimeRemaining(levels[0].time * 60);
        }
    }, []); // Empty dependency array since we only want this to run once

    // Save timer state - debounced to prevent too frequent updates
    useEffect(() => {
        const saveTimer = () => {
            if (levels.length > 0) {
                const timerState: TimerState = {
                    currentLevelId: levels[currentLevelIndex].id,
                    timeRemaining,
                    isRunning,
                    startTime
                };
                localStorage.setItem('timerState', JSON.stringify(timerState));
            }
        };

        // Only save after 100ms of no changes
        const timeoutId = setTimeout(saveTimer, 100);
        return () => clearTimeout(timeoutId);
    }, [currentLevelIndex, timeRemaining, isRunning, startTime]);

    // Timer logic
    useEffect(() => {
        let interval: number;

        if (isRunning && startTime) {
            interval = window.setInterval(() => {
                const now = Date.now();
                const elapsed = Math.floor((now - startTime) / 1000);
                const newTimeRemaining = Math.max((levels[currentLevelIndex]?.time || 0) * 60 - elapsed, 0);
                
                setTimeRemaining(newTimeRemaining);

                if (newTimeRemaining === 0) {
                    setIsRunning(false);
                    setStartTime(null);
                    setIsBlinking(true);
                    gongSound.current?.play();
                }
            }, 1000);
        }

        return () => {
            if (interval) {
                window.clearInterval(interval);
            }
        };
    }, [isRunning, startTime, currentLevelIndex, levels]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        if (timeRemaining === 0) {
            handleNextLevel();
        } else {
            if (isRunning) {
                pauseTimer();
            } else {
                startTimer();
            }
        }
    };

    const handleNextLevel = () => {
        if (currentLevelIndex < levels.length - 1) {
            setCurrentLevelIndex(currentLevelIndex + 1);
            setTimeRemaining(levels[currentLevelIndex + 1].time * 60);
            setIsBlinking(false);
            setIsRunning(false);
            setStartTime(null);
        }
    };

    const handlePreviousLevel = () => {
        if (currentLevelIndex > 0) {
            setCurrentLevelIndex(currentLevelIndex - 1);
            setTimeRemaining(levels[currentLevelIndex - 1].time * 60);
            setIsBlinking(false);
            setIsRunning(false);
            setStartTime(null);
        }
    };

    const startTimer = () => {
        setIsRunning(true);
        setStartTime(Date.now() - ((levels[currentLevelIndex]?.time || 0) * 60 - timeRemaining) * 1000);
        setIsBlinking(false);
    };

    const pauseTimer = () => {
        setIsRunning(false);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setStartTime(null);
        setTimeRemaining((levels[currentLevelIndex]?.time || 0) * 60);
        setIsBlinking(false);
    };

    const currentLevel = levels[currentLevelIndex];
    const nextLevel = currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : null;
    
    return (
        <div className="w-full min-h-screen">
            <audio ref={gongSound} src="../src/assets/gong.mp3" />
            
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
                <div className={`grid-item col-span-full ${isBlinking ? 'animate-blink bg-red-900' : ''}`}>
                    <div className="flex items-center justify-between py-8">
                        {/* Tournament Info - Left Side */}
                        <div className="w-1/3">
                            <h2 className="text-2xl font-bold mb-4">Tournament Info</h2>
                            <div className="space-y-2">
                                <p className="text-xl">Players: {players}</p>
                                <p className="text-xl">Buy-in: {buyIn}</p>
                                <p className="text-xl">Total Prize Pool: {totalPrizePool}</p>
                                <p className="text-xl">Starting Stack: {startStack}</p>
                            </div>
                        </div>

                        {/* Timer Section - Center */}
                        <div className="w-1/3 flex flex-col items-center justify-center">
                            <div className="text-4xl font-bold mb-4">
                                LEVEL {currentLevel?.isBreak ? "BREAK" : currentLevel?.level}
                            </div>
                            <div className="text-3xl mb-6">
                                {!currentLevel?.isBreak && `BLINDS: ${currentLevel?.small}/${currentLevel?.big}`}
                            </div>
                            <div className="text-5xl font-mono mb-8">
                                {formatTime(timeRemaining)}
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={handlePreviousLevel}
                                    className="cs-btn px-4 py-2"
                                    disabled={currentLevelIndex === 0}
                                >
                                    Previous
                                </button>
                                <button 
                                    onClick={toggleTimer}
                                    className={`cs-btn ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} px-8 py-4 text-xl`}
                                >
                                    {timeRemaining === 0 && nextLevel 
                                        ? `Start Level ${nextLevel.isBreak ? "BREAK" : nextLevel.level}`
                                        : isRunning ? 'Pause' : 'Start'}
                                </button>
                                <button 
                                    onClick={handleNextLevel}
                                    className="cs-btn px-4 py-2"
                                    disabled={currentLevelIndex === levels.length - 1}
                                >
                                    Next
                                </button>
                            </div>
                        </div>

                        {/* Tournament Info - Right Side */}
                        <div className="w-1/3"></div>
                    </div>
                </div>

                <div className="grid-item col-span-full">
                    <div className="tournament-info">
                        <div className="tournament-section">
                            <h3>Prize Distribution</h3>
                            {prizeDistribution.map((prize: Prizes, index: number) => (
                                <div key={index} className="price-box">
                                    <span>
                                        {index === 0 && '🥇'}
                                        {index === 1 && '🥈'}
                                        {index === 2 && '🥉'}
                                        {index > 2 && `${index + 1}:th`}
                                    </span>
                                    <span>{prize.prize}</span>
                                </div>
                            ))}
                        </div>

                        <div className="tournament-section">
                            <h3>Levels</h3>
                            <div className="levels-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Level</th>
                                            <th>Small</th>
                                            <th>Big</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {levels.map((level: Level) => (
                                            <tr key={level.id} className={currentLevel?.id === level.id ? 'bg-gray-900' : ''}>
                                                {level.isBreak ? (
                                                    <>
                                                        <td>BREAK</td>
                                                        <td>BREAK</td>
                                                        <td>BREAK</td>
                                                        <td>{level.time}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td>{level.level}</td>
                                                        <td>{level.small}</td>
                                                        <td>{level.big}</td>
                                                        <td>{level.time}</td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="tournament-section">
                            <h3>Chips</h3>
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
                </div>
            </div>
        </div>
    );
};

export default TournamentPage;
