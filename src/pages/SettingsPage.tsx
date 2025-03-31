import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';

export interface Prizes {
    place: number;
    prize: number;
}

export interface Chips {
    color: string;
    value: number;
}

export interface Level {
    id: number;
    level: string;
    small: number;
    big: number;
    time: number;
    isBreak: boolean;
}

export interface TournamentData {
    players: number;
    buyIn: number;
    totalPrizePool: number;
    startStack: number;
    prizeDistribution: Prizes[];
    chips: Chips[];
    levels: Level[];
    isRebuyAllowed: boolean;
    rebuyValue: number;
}

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State for the values, with some standard values
    const [players, setPlayers] = useState(10);
    const [buyIn, setBuyIn] = useState(500);
    const [totalPrizePool, setTotalPrizePool] = useState(5000);
    const [startStack, setStartStack] = useState(2500);
    const [prizeDistribution, setPrizeDistribution] = useState<Prizes[]>([]);
    const [chips, setChipValues] = useState<Chips[]>([
        { color: 'white', value: 10 },
        { color: 'red', value: 50 },
        { color: 'blue', value: 100 },
        { color: 'black', value: 500 }
    ]);
    const [levels, setLevels] = useState<Level[]>([
        { id: 1, level: "1", small: 10, big: 20, time: 15, isBreak: false },
        { id: 2, level: "2", small: 25, big: 50, time: 15, isBreak: false },
        { id: 3, level: "3", small: 50, big: 100, time: 15, isBreak: false },
        { id: 4, level: "4", small: 75, big: 150, time: 15, isBreak: false },
        { id: 5, level: "Break", small: 0, big: 0, time: 15, isBreak: true },
        { id: 6, level: "5", small: 150, big: 300, time: 20, isBreak: false },
        { id: 7, level: "6", small: 200, big: 400, time: 20, isBreak: false },
        { id: 8, level: "7", small: 350, big: 700, time: 20, isBreak: false },
        { id: 9, level: "8", small: 500, big: 1000, time: 20, isBreak: false },
    ]);

    const [selectedColor, setSelectedColor] = useState('red');
    const [chipValue, setChipValue] = useState(1);
    const [isTournamentActive, setIsTournamentActive] = useState(false);
    const [isRebuyAllowed, setIsRebuyAllowed] = useState(true);
    const [rebuyValue, setRebuyValue] = useState(0);

    // Load saved tournament data when component mounts
    useEffect(() => {
        const savedData = localStorage.getItem('tournamentData');
        if (savedData) {
            const tournamentData: TournamentData = JSON.parse(savedData);
            setPlayers(tournamentData.players);
            setBuyIn(tournamentData.buyIn);
            setTotalPrizePool(tournamentData.totalPrizePool);
            setStartStack(tournamentData.startStack);
            setPrizeDistribution(tournamentData.prizeDistribution);
            setChipValues(tournamentData.chips);
            setLevels(tournamentData.levels);
            setIsRebuyAllowed(tournamentData.isRebuyAllowed || false);
            setRebuyValue(tournamentData.rebuyValue);
        }
    }, []);

    // Check if tournament is active on component mount
    useEffect(() => {
        const timerState = localStorage.getItem('timerState');
        setIsTournamentActive(!!timerState);
    }, []);

    const calculateTotalPrizePool = () => {
        const validPlayers = players || 0;
        const validBuyIn = buyIn || 0;
        setTotalPrizePool(validPlayers * validBuyIn);
    };

    const handleColorChange = (event: any) => {
        setSelectedColor(event.target.value);
    };

    const handleChipValueChange = (event: any) => {
        const value = event.target.value === '' ? 1 : parseInt(event.target.value);
        setChipValue(value);
    };

    const saveChip = () => {
        // Kontrollera om färgen redan finns i arrayen
        const existingChipIndex = chips.findIndex(chip => chip.color === selectedColor);
      
        if (existingChipIndex > -1) {
          // Färgen finns redan, uppdatera värdet
          const newChips = [...chips];
          newChips[existingChipIndex] = { color: selectedColor, value: chipValue };
          setChipValues(newChips);
        } else {
          // Färgen finns inte, lägg till ett nytt chip
          setChipValues([...chips, { color: selectedColor, value: chipValue }]);
        }
      };


    const calculatePrizeProportions = (numberOfPlayers: number) => {
        // Cap number of players at 100
        const cappedPlayers = Math.min(numberOfPlayers, 100);

        // Base prize distribution rules for different player counts
        const baseProportions: { [key: string]: number[] } = {
            5: [100],
            7: [55, 25, 20],
            15: [50, 25, 15, 10],
            25: [45, 25, 15, 10, 5],
            50: [35, 20, 15, 10, 8, 7, 5],
            100: [26, 17, 12, 7, 6, 5, 4, 4, 3, 3, 3, 2]
        };
      
        // Find the appropriate base distribution
        let proportions: number[];
        if (cappedPlayers <= 5) {
            proportions = baseProportions[5];
        } else if (cappedPlayers <= 7) {
            proportions = baseProportions[7];
        } else if (cappedPlayers <= 15) {
            proportions = baseProportions[15];
        } else if (cappedPlayers <= 25) {
            proportions = baseProportions[25];
        } else if (cappedPlayers <= 50) {
            proportions = baseProportions[50];
        } else {
            proportions = baseProportions[100];
        }

        // Ensure we always return a valid array
        return proportions || [100];
    };

    const calculatePrizeDistribution = (players: number, totalPrizePool: number, buyIn: number) => {
        if (!players || !totalPrizePool || !buyIn) {
            return [];
        }

        const proportions = calculatePrizeProportions(players);
        let remainingPrizePool = totalPrizePool;
        const prizeDistribution: Prizes[] = [];

        // Calculate how many places we can pay with minimum buyIn
        const maxPlaces = Math.min(
            Math.floor(totalPrizePool / buyIn), // Maximum places we can pay with buyIn minimum
            proportions.length // Don't exceed our proportion array length
        );

        // Calculate prizes for all places except first
        for (let i = maxPlaces - 1; i > 0; i--) {
            const prize = Math.max(
                Math.floor((proportions[i] / 100) * totalPrizePool),
                buyIn // Ensure minimum payout is buyIn
            );
            if (remainingPrizePool - prize >= buyIn) { // Check if we can still pay at least buyIn to first place
                prizeDistribution.unshift({ place: i + 1, prize });
                remainingPrizePool -= prize;
            } else {
                break;
            }
        }

        // Add first place with remaining prize pool
        prizeDistribution.unshift({ place: 1, prize: remainingPrizePool });

        return prizeDistribution;
    };

    React.useEffect(() => {
        calculateTotalPrizePool();
        
        const newPrizeDistribution = calculatePrizeDistribution(players || 0, totalPrizePool || 0, buyIn || 0);
        setPrizeDistribution(newPrizeDistribution);

    }, [players, totalPrizePool, buyIn]);

    
    const startTournament = () => {
        const tournamentData: TournamentData = {
            players,
            buyIn,
            totalPrizePool,
            startStack,
            prizeDistribution,
            chips,
            levels,
            isRebuyAllowed,
            rebuyValue
        };

        // Save to local storage
        localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
        
        // Navigate to tournament page
        navigate('/TournamentPage', { state: { tournamentData } }); 
    };

    const resetSettings = () => {
        // Clear local storage
        localStorage.removeItem('tournamentData');
        localStorage.removeItem('timerState');
        
        // Reset all state to default values
        setPlayers(10);
        setBuyIn(500);
        setTotalPrizePool(5000);
        setStartStack(2500);
        setPrizeDistribution([
            { place: 1, prize: 2250 },  // 45% of 5000
            { place: 2, prize: 1000 },  // 20% of 5000
            { place: 3, prize: 1000 },  // 20% of 5000
            { place: 4, prize: 500 },   // 10% of 5000
            { place: 5, prize: 250 }    // 5% of 5000
        ]);
        setChipValues([
            { color: 'white', value: 10 },
            { color: 'red', value: 50 },
            { color: 'blue', value: 100 },
            { color: 'black', value: 500 }
        ]);
        setLevels([
            { id: 1, level: "1", small: 10, big: 20, time: 15, isBreak: false },
            { id: 2, level: "2", small: 25, big: 50, time: 15, isBreak: false },
            { id: 3, level: "3", small: 50, big: 100, time: 15, isBreak: false },
            { id: 4, level: "4", small: 75, big: 150, time: 15, isBreak: false },
            { id: 5, level: "Break", small: 0, big: 0, time: 15, isBreak: true },
            { id: 6, level: "5", small: 150, big: 300, time: 20, isBreak: false },
            { id: 7, level: "6", small: 200, big: 400, time: 20, isBreak: false },
            { id: 8, level: "7", small: 350, big: 700, time: 20, isBreak: false },
            { id: 9, level: "8", small: 500, big: 1000, time: 20, isBreak: false },
        ]);
        setSelectedColor('red');
        setChipValue(1);
        setIsTournamentActive(false);
        setIsRebuyAllowed(true);
    };

    // Level management functions
    const handleLevelChange = (id: number, field: keyof Level, value: string | number | boolean) => {
        setLevels(levels.map(level => {
            if (level.id === id) {
                const updatedLevel = { ...level };
                
                switch (field) {
                    case 'small':
                    case 'big':
                        const numValue = value === '' ? 0 : Number(value);
                        updatedLevel[field] = isNaN(numValue) ? 0 : numValue;
                        if (field === 'small' && !level.isBreak) {
                            updatedLevel.big = isNaN(numValue) ? 0 : numValue * 2;
                        }
                        break;
                    case 'time':
                        updatedLevel.time = Number(value) || 0;
                        break;
                    case 'level':
                        updatedLevel.level = String(value);
                        break;
                    case 'isBreak':
                        updatedLevel.isBreak = Boolean(value);
                        break;
                    case 'id':
                        updatedLevel.id = Number(value);
                        break;
                }
                
                return updatedLevel;
            }
            return level;
        }));
    };

    const getNextLevelNumber = () => {
        // Get all non-break levels and their numbers
        const levelNumbers = levels
            .filter(level => !level.isBreak)
            .map(level => parseInt(level.level))
            .sort((a, b) => a - b);
        
        // If no levels exist, start at 1
        if (levelNumbers.length === 0) return 1;
        
        // Find the first missing number in the sequence
        for (let i = 1; i <= levelNumbers.length; i++) {
            if (!levelNumbers.includes(i)) {
                return i;
            }
        }
        
        // If no gaps found, return the next number
        return Math.max(...levelNumbers) + 1;
    };

    const addNewLevel = () => {
        const newId = Math.max(...levels.map(l => l.id)) + 1;
        const nextLevelNumber = getNextLevelNumber();
        
        // Find the last non-break level
        const lastNonBreakLevel = [...levels]
            .reverse()
            .find(level => !level.isBreak);

        // Calculate new blind levels based on the last level
        const newSmall = lastNonBreakLevel ? lastNonBreakLevel.small * 2 : 0;
        const newBig = lastNonBreakLevel ? lastNonBreakLevel.big * 2 : 0;

        const newLevel: Level = {
            id: newId,
            level: nextLevelNumber.toString(),
            small: newSmall,
            big: newBig,
            time: 15,
            isBreak: false
        };
        setLevels([...levels, newLevel]);
    };

    const addBreak = () => {
        const newId = Math.max(...levels.map(l => l.id)) + 1;
        const newBreak: Level = {
            id: newId,
            level: "Break",
            small: 0,
            big: 0,
            time: 15,
            isBreak: true
        };
        setLevels([...levels, newBreak]);
    };

    const deleteLevel = (id: number) => {
        // First remove the level
        const remainingLevels = levels.filter(level => level.id !== id);
        
        // Then reorder the remaining non-break levels
        const reorderedLevels = remainingLevels.map(level => {
            if (!level.isBreak) {
                // Find how many non-break levels come before this one
                const nonBreakLevelsBefore = remainingLevels
                    .filter(l => !l.isBreak && l.id < level.id)
                    .length;
                
                // The new level number should be the count of non-break levels before this one + 1
                return {
                    ...level,
                    level: (nonBreakLevelsBefore + 1).toString()
                };
            }
            return level;
        });

        setLevels(reorderedLevels);
    };

    const updateAllTimes = (newTime: number) => {
        setLevels(levels.map(level => ({ ...level, time: newTime })));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4 px-4">
                <h1 className="poker-header">Pokertournament - Setup</h1>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={resetSettings}
                        className="cs-btn bg-red-600 hover:bg-red-700 px-4 py-2"
                    >
                        Reset Settings
                    </button>
                    {isTournamentActive && (
                        <h1 className="poker-header">Tournament in Progress</h1>
                    )}
                </div>
            </div>

            <div className="grid-container">
                <div className="grid-item">
                    <h2>Players settings</h2>
                    <div className="player-settings-content">
                        <div className="pt-3">
                            <input
                                type="number"
                                id="players"
                                className="cs-input"
                                value={players || ''}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                                    setPlayers(Math.min(value, 100));
                                }}
                                min="0"
                            />
                            <label className="cs-input__label p-3" htmlFor="players">Number of players (max 100)</label>
                        </div>
                        <div className="pt-3">
                            <input
                                type="number"
                                id="buyin"
                                className="cs-input"
                                value={buyIn || ''}
                                step={10}
                                onChange={(e) => setBuyIn(e.target.value === '' ? 0 : parseInt(e.target.value))}
                                min="0"
                            />          
                            <label className="cs-input__label p-3" htmlFor="buyin">Buy-in</label>
                        </div>
                        <div className="pt-3">
                            <input
                                type="number"
                                id="total-amount"
                                className="cs-input"
                                value={totalPrizePool || ''}
                                readOnly
                            />
                            <label className="cs-input__label p-3" htmlFor="total-amount">Total amount of money in price pool</label>
                        </div>
                        <div className="pt-3">
                            <div className="cs-checkbox flex items-center gap-2">
                                <input 
                                    id="checkbox" 
                                    type="checkbox" 
                                    checked={isRebuyAllowed}
                                    onChange={(e) => setIsRebuyAllowed(e.target.checked)}
                                />
                                <label className="cs-checkbox__label" htmlFor="checkbox"> Allow Re-buys</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid-item">
                    <h2>Price table info</h2>
                    <div className="pt-3">
                        {prizeDistribution && prizeDistribution.length > 0 ? (
                            prizeDistribution.map((prize, index) => (
                                <div key={index} className="price-box">
                                    {index === 0 && '🥇'}
                                    {index === 1 && '🥈'}
                                    {index === 2 && '🥉'}
                                    {index > 2 && `${index + 1}:th`}
                                    <span>{prize?.prize || 0}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500">Enter number of players and buy-in to see prize distribution</div>
                        )}
                    </div>
                </div>
               

                <div className="grid-item">
                    <h2>Chips settings</h2>
                    <div className="pt-3">
                        <div className="player-settings">
                            <input
                                type="number"
                                id="start-stack"
                                className="cs-input"
                                value={startStack || ''}
                                step={10}
                                onChange={(e) => setStartStack(e.target.value === '' ? 0 : parseInt(e.target.value))}
                                min="0"
                            />
                            <label className="cs-input__label label p-3" htmlFor="start-stack">Start stack</label>
                        </div>

                        <div className="pt-3">
                            <select 
                                className="cs-select" 
                                name="colors" 
                                id="colors"
                                onChange={handleColorChange}>
                                <option value="red">Red</option>
                                <option value="green">Green</option>
                                <option value="blue">Blue</option>
                                <option value="black">Black</option>
                                <option value="white">White</option>
                            </select>
                            <label  className="cs-input__label p-3" htmlFor="color">Choose a color for chip</label>
                        </div>

                        <div className="pt-3">
                            <input
                                type="number"
                                id="chip-value"
                                className="cs-input"
                                value={chipValue}
                                onChange={handleChipValueChange}
                                min={1}
                            />
                            <label className="cs-input__label p-3" htmlFor="chip-value">Choose a value of the chip</label>
                        </div>

                        <div className="pt-3">
                            <button className="cs-btn" onClick={saveChip}>Add chip</button>
                        </div>
                    </div>
                </div>

                <div className="grid-item">
                    <h2>Selected chips</h2>
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

                <div className="grid-item levels-table">
                    <h2>Levels and Breaks</h2>
                    <div className="pt-3">
                        <div className="level-controls mb-4">
                            <button className="cs-btn mr-2" onClick={addNewLevel}>Add Level</button>
                            <button className="cs-btn mr-2" onClick={addBreak}>Add Break</button>
                            <div className="inline-block">
                                <input
                                    type="number"
                                    className="cs-input"
                                    placeholder="Time (min)"
                                    onChange={(e) => updateAllTimes(parseInt(e.target.value))}
                                />
                                <label className="cs-input__label ml-2">Update all times</label>
                            </div>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Level</th>
                                    <th>Small</th>
                                    <th>Big</th>
                                    <th>Time (min)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {levels.map((level) => (
                                    <tr key={level.id}>
                                        <td>
                                            <input
                                                type="text"
                                                className="cs-input w-20"
                                                value={level.isBreak ? "Break" : level.level}
                                                onChange={(e) => handleLevelChange(level.id, 'level', e.target.value)}
                                                disabled={level.isBreak}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="cs-input w-20"
                                                value={level.isBreak ? "Break" : level.small}
                                                onChange={(e) => handleLevelChange(level.id, 'small', parseInt(e.target.value))}
                                                disabled={level.isBreak}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="cs-input w-20"
                                                value={level.isBreak ? "Break" : level.big}
                                                onChange={(e) => handleLevelChange(level.id, 'big', parseInt(e.target.value))}
                                                disabled={level.isBreak}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="cs-input w-20"
                                                value={level.time}
                                                onChange={(e) => handleLevelChange(level.id, 'time', parseInt(e.target.value))}
                                            />
                                        </td>
                                        <td>
                                            <button 
                                                className="cs-btn bg-red-600 hover:bg-red-700"
                                                onClick={() => deleteLevel(level.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid-item">
                    <div className="flex flex-col gap-4">
                        {isTournamentActive ? (
                            <>
                                <button 
                                    onClick={() => {
                                        const savedData = localStorage.getItem('tournamentData');
                                        if (savedData) {
                                            navigate('/TournamentPage', { 
                                                state: { tournamentData: JSON.parse(savedData) }
                                            });
                                        }
                                    }}
                                    className="cs-btn bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3 w-full"
                                >
                                    Back to Tournament
                                </button>
                                <button 
                                    disabled
                                    className="cs-btn bg-gray-600 cursor-not-allowed text-lg px-8 py-3 w-full opacity-50"
                                >
                                    Tournament in Progress
                                </button>
                            </>
                        ) : (
                            <button 
                                id="start-tournament" 
                                onClick={startTournament}
                                className="cs-btn bg-green-600 hover:bg-green-700 text-lg px-8 py-3 w-full"
                            >
                                Start Tournament
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
