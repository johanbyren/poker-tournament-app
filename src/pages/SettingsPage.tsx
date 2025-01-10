import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

export interface ChipValues {
    white: number;
    red: number;
    // Lägg till fler färger här vid behov
};

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();

    const [timerDuration, setTimerDuration] = useState<number>(0);
    const [chipValues, setChipValues] = useState<ChipValues>({
        white: 1,
        red: 5,
    });

    const handleChipValueChange = (color: keyof ChipValues, value: number) => {
        setChipValues({
            ...chipValues,
            [color]: value,
        });
    };
    
    const startTournament = () => {
        console.log('Turnering startad!');
        console.log('Timer:', timerDuration);
        console.log('Marker:', chipValues);
        navigate('/TournamentPage', { state: { timerDuration, chipValues } }); 
    };

    return (
        <div>
            <h1>Pokerturnering - Setup</h1>

            <div>
                <h2>Timer</h2>
                <label htmlFor="timer">Tid (minuter):</label>
                <input
                type="number"
                id="timer"
                value={timerDuration}
                onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                />
            </div>

            <div>
                <h2>Marker</h2>
                <div>
                <label htmlFor="whiteChip">Vit marker:</label>
                <input
                    type="number"
                    id="whiteChip"
                    value={chipValues.white}
                    onChange={(e) => handleChipValueChange('white', parseInt(e.target.value))}
                />
                <span>kr</span>
                </div>
                <div>
                <label htmlFor="redChip">Röd marker:</label>
                <input
                    type="number"
                    id="redChip"
                    value={chipValues.red}
                    onChange={(e) => handleChipValueChange('red', parseInt(e.target.value))}
                />
                <span>kr</span>
                </div>
            </div>

            <button onClick={startTournament}>Starta Turnering</button>
        </div>
    );
};

export default SettingsPage;
