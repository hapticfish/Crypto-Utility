import React, { createContext } from 'react';
import useWebSocket from './hooks/useWebSocket';

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ url, children }) => {
    const data = useWebSocket(url);
    //websocket logic

    return (
        <WebSocketContext.Provider value={data}>
            {children}
        </WebSocketContext.Provider>
    );
};