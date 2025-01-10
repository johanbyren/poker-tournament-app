import React, { useState } from "react";
import { useLocation } from 'react-router-dom';

interface LocationState {
    timerDuration: number;
    chipValues: {
        white: number;
        red: number;
    };
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
                    <p>Timer: {state.timerDuration}</p>
                    <p>Vit marker: {state.chipValues.white}</p>
                    <p>Röd marker: {state.chipValues.red}</p>
                </>
                )}
            </div>
        </div>
    );
}

export default TournamentPage;
