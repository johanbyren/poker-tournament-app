import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
//import App from './App'; // Ta bort denna import om App.tsx inte längre används
import SettingsPage from './pages/SettingsPage';
import TournamentPage from './pages/TournamentPage';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SettingsPage />} />
        <Route path="/tournamentPage" element={<TournamentPage />} />
        {/* Lägg till fler routes här, t.ex. för spelsidan */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);