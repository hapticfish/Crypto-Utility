import React, { createContext, useState, useEffect } from 'react';

export const TickerContext = createContext();

export const TickerProvider = ({ children }) => {
    const [tickers, setTickers] = useState({});
    // logic for fetching tickers and updating tickers

    return (
        <TickerContext.Provider value={{ tickers, setTickers }}>
        {children}
        </TickerContext.Provider>
    );
};