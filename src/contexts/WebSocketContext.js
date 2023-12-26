import React, {createContext, useState, useEffect} from 'react';
import useWebSocket from '../hooks/useWebSocket';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ url, children }) => {
    const [webSocket, setWebSocket] = useState(null);
    const [subscribers, setSubscribers] = useState(0);

    const connectWebSocket = () => {
        if(!webSocket && url) {
            const newWebSocket = new WebSocket(url);
            setWebSocket(newWebSocket);
        }
    };

    const disconnectWebSocket = () => {
        if (webSocket) {
            webSocket.close();
            setWebSocket(null);
        }
    };

    const subscribe = () => setSubscribers(prev => prev + 1);
    const unsubscribe = () => setSubscribers(prev => prev - 1);

    useEffect(() => {
        if (subscribers > 0) {
            connectWebSocket();
        } else {
            disconnectWebSocket();
        }

        return () => disconnectWebSocket();
    }, [subscribers, url]);

    const contextValue = { webSocket, subscribe, unsubscribe };

    return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
};