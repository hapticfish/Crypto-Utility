import { useState, useEffect, useCallback } from "react";

const useWebSocket = (url) => {
    const [data, setData] = useState({});
    const [ws, setWs] = useState(null);
    const [attemptCount, setAttemptCount] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState("disconnected");
    const [isLoading, setIsLoading] = useState(true);

    const MAX_ATTEMPTS = 5;

    const connect = useCallback(() => {
        if (attemptCount >= MAX_ATTEMPTS) {
            console.log("Max reconnections attempts reached");
            setConnectionStatus("failed");
            return;
        }

        const webSocket = new WebSocket(url);
        console.log("Attempting WebSocket connection", url);

        setConnectionStatus("connecting");


        webSocket.onopen = () => {
            console.log("WebSocket connected");
            setIsLoading(false);
            setConnectionStatus("connected");
            setAttemptCount(0); //reset on success
        }

        webSocket.onmessage = (e) => {
            try {
                const message = JSON.parse(e.data);
                console.log("Received WebSocket data:", message) //logging of data to console
                if (message && typeof message === 'object' && !Array.isArray(message)){
                    setData(message);
                } else {
                    console.error('Invalid data format received:', message);
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
            setIsLoading(false); //Error occured, set loading to false
        };

        webSocket.onclose = () => {
            console.log("WebSocket disconnected");
            //Attempt to reconnect with a delay
            setTimeout(() => {
                setAttemptCount((prevCount) => prevCount + 1);
                connect();
            }, 3000 + attemptCount * 1000); //increase delay with each attempt
        };

        webSocket.onerror = (error) => {
            console.error("WebSocket error:", error);
            webSocket.close();
        };

        setWs(webSocket);
    }, [url, attemptCount]);

    useEffect(() => {
        connect();

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [connect, ws]);

    return { data, connectionStatus, isLoading };
};

export default useWebSocket;