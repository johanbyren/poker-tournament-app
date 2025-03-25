import React, { useState } from "react";
import { useLocation } from 'react-router-dom';

import { Level } from './SettingsPage';

interface LocationState {
    levels: Level[];
}

const TournamentPage: React.FC = () => {
    const location = useLocation();
    const state = location.state as LocationState | null; 
    
    return(
        <div>
            <div>hej hej tournament page</div>
            <div>
            <h1>Spelsida</h1>
                {state && (
                <>
                    {state.levels.map((level, index) => (
                        <div key={index}>
                            <p>Level: {level.level}, Small Blind: {level.smallBlind}, Big Blind: {level.bigBlind}, Time: {level.time}</p>
                        </div>
                    ))}
                </>
                )}
            </div>
        </div>
    );
}

export default TournamentPage;
