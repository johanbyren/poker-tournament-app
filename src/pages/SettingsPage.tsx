import React, { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Level } from '../types';

export interface Prizes {
    place: number;
    prize: number;
}

export interface Chips {
    color: string;
    value: number;
}

export interface Level {
    level: number | string;
    smallBlind: number;
    bigBlind: number;
    time: string;
}

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();

    // State for the values, with some standard values
    const [players, setPlayers] = useState(10);
    const [buyIn, setBuyIn] = useState(500);
    const [totalPrizePool, setTotalPrizePool] = useState(5000); // Denna kommer att beräknas
    const [startStack, setStartStack] = useState(2500);
    const [prizeDistribution, setPrizeDistribution] = useState<Prizes[]>([]);
    const [chips, setChipValues] = useState<Chips[]>([]);
    const [levels, setLevels] = useState<Level[]>([
        { level: 1, smallBlind: 10, bigBlind: 20, time: '15 min' },
        { level: 2, smallBlind: 25, bigBlind: 50, time: '15 min' },
        { level: 3, smallBlind: 50, bigBlind: 100, time: '15 min' },
        { level: 4, smallBlind: 75, bigBlind: 150, time: '15 min' },
        { level: 'Break', smallBlind: 0, bigBlind: 0, time: 'Break' },
        { level: 5, smallBlind: 150, bigBlind: 300, time: '20 min' },
        { level: 6, smallBlind: 200, bigBlind: 400, time: '20 min' },
        { level: 7, smallBlind: 350, bigBlind: 700, time: '20 min' },
        { level: 8, smallBlind: 500, bigBlind: 1000, time: '20 min' },
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
        console.log('Turnering startad!');
        // console.log('Timer:', timerDuration);
        // console.log('Marker:', chipValues);
        navigate('/TournamentPage', { state: { levels } }); 
        // navigate('/TournamentPage', { state: { timerDuration, chipValues } }); 
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

                <div className="grid-item levels-table">
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
                            {levels.map((level, index) => (
                                <tr key={index}>
                                    <td><input type="text" value={level.level} onChange={(e) => { const newLevels = [...levels]; newLevels[index].level = e.target.value; setLevels(newLevels); }} /></td>
                                    <td><input type="number" value={level.smallBlind} onChange={(e) => { const newLevels = [...levels]; newLevels[index].smallBlind = parseInt(e.target.value); setLevels(newLevels); }} /></td>
                                    <td><input type="number" value={level.bigBlind} onChange={(e) => { const newLevels = [...levels]; newLevels[index].bigBlind = parseInt(e.target.value); setLevels(newLevels); }} /></td>
                                    <td><input type="text" value={level.time} onChange={(e) => { const newLevels = [...levels]; newLevels[index].time = e.target.value; setLevels(newLevels); }} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

     
            </div>


            {/* ... resten av koden (price-distribution, chips-table, levels-table, button) ... */}
            <div className="price-distribution">

                </div>
                
                <div className="chips-table">
                    <h2>Chips color &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Value</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Chips color</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{color: 'white'}}>White</td>
                                <td>1</td>
                            </tr>
                            <tr>
                                <td style={{color: 'red'}}>Red</td>
                                <td>5</td>
                            </tr>
                            <tr>
                                <td style={{color: 'green'}}>Green</td>
                                <td>10</td>
                            </tr>
                            <tr>
                                <td style={{color: 'blue'}}>Blue</td>
                                <td>20</td>
                            </tr>
                            <tr>
                                <td style={{color: 'black'}}>Black</td>
                                <td>50</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                



            <button id="start-tournament"  onClick={startTournament}>
                Start Tournament
            </button>
        </div>
    );
};

export default SettingsPage;
