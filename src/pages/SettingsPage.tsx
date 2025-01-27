import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

export interface ChipValues {
    white: number;
    red: number;
    // Lägg till fler färger här vid behov
};

export interface Prizes {
    place: number;
    prize: number;
}

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();

    // State for the values, with some standard values
    const [players, setPlayers] = useState(10);
    const [buyIn, setBuyIn] = useState(500);
    const [totalPrizePool, setTotalPrizePool] = useState(5000); // Denna kommer att beräknas
    const [startStack, setStartStack] = useState(2500);
    const [prizeDistribution, setPrizeDistribution] = useState<Prizes[]>([]);


    const calculateTotalPrizePool = () => {
        setTotalPrizePool(players * buyIn);
    };

    const calculatePrizeDistribution = (players: number, totalPrizePool: number, buyIn: number) => {
        const numberOfPlayers =  players;
        const totalPrizeSum = totalPrizePool;
        const buyInSum = buyIn;

        let proportions = [];
        
        if (numberOfPlayers <= 5) {
          proportions = [100];
        } else if (numberOfPlayers <= 8) {
          proportions = [70, 30];
        } else if (numberOfPlayers <= 15) {
          proportions = [50, 30, 20];
        } else if (numberOfPlayers <= 25) {
          proportions = [50, 25, 20, 10];
        } else {
          // För större turneringar, ge priser till 1 av 10 spelare
          const numberOfPrizes = Math.floor(numberOfPlayers / 10);
          proportions = Array(numberOfPrizes).fill(0); // Initiera med nollor
          proportions[0] = 40;
          proportions[1] = 25;
          proportions[2] = 20;
          if (numberOfPrizes > 3) {
            proportions[3] = 10;
          }

          if (numberOfPrizes > 4) {
            proportions[4] = 5;
          }
        }

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

    React.useEffect(() => {
        calculateTotalPrizePool();
        const newPrizeDistribution = calculatePrizeDistribution(players, totalPrizePool, buyIn)
        setPrizeDistribution(newPrizeDistribution);
    }, [players, totalPrizePool, buyIn]);

    
    const startTournament = () => {
        console.log('Turnering startad!');
        // console.log('Timer:', timerDuration);
        // console.log('Marker:', chipValues);
        navigate('/TournamentPage', { state: { } }); 
        // navigate('/TournamentPage', { state: { timerDuration, chipValues } }); 
    };

    // const prizeDistribution: { place: number; prize: number }[] = []; // Skapa en lista för att lagra prisfördelningen
    //const prizeDistribution = calculatePrizeDistribution(players, totalPrizePool, buyIn)


    return (
        <div>
            <h1 className="poker-header">Pokertournament - Settings</h1>

            <div className="container">
                <div className="column">
                    <div>
                        <h2>Players info</h2>
                    </div>
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
                        />
                        <label className="cs-input__label p-3" htmlFor="total-amount">Total amount of money in price pool</label>
                    </div>
                </div>

                <div className="column">
                    <div>
                        <h2>Price info</h2>
                    </div>

                    {/* <div className="pt-3">
                        <div className="price-box">🥇 <span>2500</span></div>
                        <div className="price-box">🥈 <span>1200</span></div>
                        <div className="price-box">🥉 <span>800</span></div>
                        <div className="price-box">4:th <span>500</span></div>
                    </div> */}

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
                            <tr>
                                <td>1</td>
                                <td>10</td>
                                <td>20</td>
                                <td>15 min</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>25</td>
                                <td>50</td>
                                <td>15 min</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>50</td>
                                <td>100</td>
                                <td>15 min</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>75</td>
                                <td>150</td>
                                <td>15 min</td>
                            </tr>
                            <tr>
                                <td>Break</td>
                                <td>Break</td>
                                <td>Break</td>
                                <td>Break</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>150</td>
                                <td>300</td>
                                <td>20 min</td>
                            </tr>
                            <tr>
                                <td>6</td>
                                <td>200</td>
                                <td>400</td>
                                <td>20 min</td>
                            </tr>
                            <tr>
                                <td>7</td>
                                <td>350</td>
                                <td>700</td>
                                <td>20 min</td>
                            </tr>
                            <tr>
                                <td>8</td>
                                <td>500</td>
                                <td>1000</td>
                                <td>20 min</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="player-settings">
                        <input
                            type="number"
                            id="start-stack"
                            className="cs-input"
                            value={startStack}
                            onChange={(e) => setStartStack(parseInt(e.target.value))}
                        />
                        <label className="cs-input__label label" htmlFor="start-stack">Start stack</label>
                    </div>

            <button id="start-tournament"  onClick={startTournament}>
                Start Tournament
            </button>
        </div>
    );
};

export default SettingsPage;
