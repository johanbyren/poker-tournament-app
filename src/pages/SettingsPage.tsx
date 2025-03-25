import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

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
}

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();

    // State for the values, with some standard values
    const [players, setPlayers] = useState(10);
    const [buyIn, setBuyIn] = useState(500);
    const [totalPrizePool, setTotalPrizePool] = useState(5000);
    const [startStack, setStartStack] = useState(2500);
    const [prizeDistribution, setPrizeDistribution] = useState<Prizes[]>([]);
    const [chips, setChipValues] = useState<Chips[]>([]);
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
  

    const calculateTotalPrizePool = () => {
        setTotalPrizePool(players * buyIn);
    };

    const handleColorChange = (event: any) => {
        setSelectedColor(event.target.value);
    };

    const handleChipValueChange = (event: any) => {
        setChipValue(parseInt(event.target.value));
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


    const calculatePrizeDistribution = (players: number, totalPrizePool: number, buyIn: number) => {
        const numberOfPlayers =  players;
        const totalPrizeSum = totalPrizePool;
        const buyInSum = buyIn;

        const proportions = calculatePrizeProportions(numberOfPlayers)

        // Beräkna priser baserat på proportioner
        let remainingPrizeSum = totalPrizeSum;
        const newPrizeDistribution = [];


        for (let i = 0; i < proportions.length; i++) {
            const prize = Math.floor((totalPrizeSum * proportions[i]) / 100 / buyInSum) * buyInSum;
            newPrizeDistribution.push({ place: i + 1, prize });
            remainingPrizeSum -= prize;
        }

        // Fördela återstående summa proportionellt baserat på prisskillnad
        if (remainingPrizeSum > 0 && newPrizeDistribution.length > 1) {
            let prizeDiffSum = 0;
            for (let i = 0; i < newPrizeDistribution.length - 1; i++) { // Exkludera sista platsen
                const nextPrize = newPrizeDistribution[i + 1]?.prize || 0; // Nästa plats pris, eller 0 om det är sista platsen
                prizeDiffSum += newPrizeDistribution[i].prize - nextPrize; 
            }

            for (let i = 0; i < newPrizeDistribution.length - 1; i++) { // Exkludera sista platsen
                const nextPrize = newPrizeDistribution[i + 1]?.prize || 0;
                const extraPrize = Math.floor((remainingPrizeSum * (newPrizeDistribution[i].prize - nextPrize)) / prizeDiffSum / buyInSum) * buyInSum;
                newPrizeDistribution[i].prize += extraPrize;
                remainingPrizeSum -= extraPrize;
            }
            
            // Lägg eventuellt kvarvarande belopp till första platsen (för att undvika avrundningsfel)
            newPrizeDistribution[0].prize += remainingPrizeSum;         
        }

        console.log('Priser: ', newPrizeDistribution)
        return newPrizeDistribution; // Uppdatera state här
        
    }


    function calculatePrizeProportions(numberOfPlayers: number) {
        // Basfördelning för upp till 25 spelare
        const baseProportions: { [key: string]: number[] } = {
          5: [100],
          7: [70, 30],
          10: [50, 30, 20],
          25: [50, 25, 20, 10],
          50: [30, 20, 15, 10, 8, 7, 5, 5],
        };
      
        // Hitta den närmaste basfördelningen
        let baseKey = Object.keys(baseProportions).find(key => numberOfPlayers <= parseInt(key, 10)) ?? 'defaultKey';
        let proportions = baseProportions[baseKey];
      
        if (numberOfPlayers > 50) {
          // Beräkna antalet extra prisplatser
          const extraPrizes = Math.floor((numberOfPlayers - 25) / 10); 
      
          // Lägg till extra prisplatser med en initial fördelning (t.ex. 1% per plats)
          proportions = [...proportions, ...Array(extraPrizes).fill(1)];
      
          // Justera proportionerna för att summera till 100%
          const total = proportions.reduce((sum: any, p: any) => sum + p, 0);
          const adjustmentFactor = 100 / total;
          proportions = proportions.map((p: number) => Math.round(p * adjustmentFactor));
      
          // Om justeringen leder till att summan inte är exakt 100%, 
          // korrigera det genom att lägga till/ta bort från den största andelen.
          const newTotal = proportions.reduce((sum: any, p: any) => sum + p, 0);
          if (newTotal !== 100) {
            const diff = 100 - newTotal;
            proportions[0] += diff;
          }
        }

        console.log('proporions: ', proportions)
      
        return proportions;
      }

    React.useEffect(() => {
        calculateTotalPrizePool();
        
        const newPrizeDistribution = calculatePrizeDistribution(players, totalPrizePool, buyIn)
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
            levels
        };

        console.log('Tournament Data:', tournamentData);
        navigate('/TournamentPage', { state: { tournamentData } }); 
    };

    // Level management functions
    const handleLevelChange = (id: number, field: keyof Level, value: string | number | boolean) => {
        setLevels(levels.map(level => {
            if (level.id === id) {
                const updatedLevel = { ...level, [field]: value };
                // If small blind changes, update big blind automatically
                if (field === 'small' && !level.isBreak) {
                    updatedLevel.big = (value as number) * 2;
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
            <h1 className="poker-header">Pokertournament - Setup</h1>

            <div className="grid-container">

                <div className="grid-item">
                    <h2>Players settings</h2>
                    <div className="pt-3">
                        <input
                            type="number"
                            id="players"
                            className="cs-input"
                            value={players}
                            onChange={(e) => setPlayers(parseInt(e.target.value))}
                        />
                        <label className="cs-input__label p-3" htmlFor="players">Number of players</label>
                    </div>
                    <div className="pt-3">
                        <input
                            type="number"
                            id="buyin"
                            className="cs-input"
                            value={buyIn}
                            step={10}
                            onChange={(e) => setBuyIn(parseInt(e.target.value))}
                        />          
                        <label className="cs-input__label p-3" htmlFor="buyin">Buy-in</label>
                    </div>
                    <div className="pt-3">
                        <input
                            type="number"
                            id="total-amount"
                            className="cs-input"
                            value={totalPrizePool}
                            readOnly
                            // disabled
                        />
                        <label className="cs-input__label p-3" htmlFor="total-amount">Total amount of money in price pool</label>
                    </div>
                </div>

                <div className="grid-item">
                    <h2>Price table info</h2>
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
                    <h2>Chips settings</h2>

                    <div className="player-settings">
                        <input
                            type="number"
                            id="start-stack"
                            className="cs-input"
                            value={startStack}
                            step={10}
                            onChange={(e) => setStartStack(parseInt(e.target.value))}
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

                <div className="grid-item">
                    <h2>Selected chips</h2>
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
                                    <span>{chip.value}</span>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="grid-item levels-table">
                    <h2>Levels and Breaks</h2>
                    <div className="level-controls mb-4">
                        <button className="cs-btn mr-2" onClick={addNewLevel}>Add Level</button>
                        <button className="cs-btn mr-2" onClick={addBreak}>Add Break</button>
                        <div className="inline-block">
                            <input
                                type="number"
                                className="cs-input w-24"
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

                <div className="grid-item">
                    <button 
                        id="start-tournament" 
                        onClick={startTournament}
                        className="cs-btn bg-green-600 hover:bg-green-700 text-lg px-8 py-3 w-full"
                    >
                        Start Tournament
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
