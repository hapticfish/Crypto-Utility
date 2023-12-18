

import React, { createContext, useState, useEffect,useContext } from 'react';
import { WebSocketContext } from './WebSocketContext';

export const TickerContext = createContext();

export const TickerProvider = ({ children }) => {
    const [tickers, setTickers] = useState({});
    const [previousTickers, setPreviousTickers] = useState({});
    const webSocketData = useContext(WebSocketContext);

    useEffect(() => {
        if (webSocketData) {
            setPreviousTickers(tickers);
            setTickers(webSocketData);
        }
    }, [webSocketData, tickers]);

    return (
        <TickerContext.Provider value={{ tickers, previousTickers }}>
        {children}
        </TickerContext.Provider>
    );
};