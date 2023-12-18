
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './components/HomePage';
import SplashPage from './components/SplashPage';
import AccountingPage from './components/AccountingPage';
import CalculatorPage from './components/CalculatorPage';
import {WebSocketContext, WebSocketProvider} from "./contexts/WebSocketContext";
import {TickerProvider} from "./contexts/TickerContext";



function App() {
  return (
      <WebSocketProvider url={"ws://localhost:8080/ws"}>
          <TickerProvider>
              <Router>
                  <Routes>
                      <Route path="/" element={<SplashPage />} />
                      <Route path="/accounting" element={<AccountingPage />} />
                      <Route path="/calculator" element={<CalculatorPage />} />
                      <Route path="/home" element={<HomePage />} />
                  </Routes>
              </Router>
          </TickerProvider>
      </WebSocketProvider>

  );
}

export default App;
