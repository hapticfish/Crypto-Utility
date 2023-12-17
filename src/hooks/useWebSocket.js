import { useState, useEffect, useCallback } from "react";

const useWebSocket = (url) => {
    const [data, setData] = useState({});
    const [ws, setWs] = useState(null);

    const connect = useCallback(() => {
        const webSocket = new WebSocket(url);

        webSocket.onopen = () => console.log("WebSocket connected");
        webSocket.onmessage = (e) => {
            const message = JSON.parse(e.data);
            setData(message);
        };
        webSocket.onclose = () => {
            console.log("WebSocket disconnected");
            //Attempt to reconnect with a delay
            setTimeout(() => {
                connect();
            }, 3000); //reconnect after 3 sec
        };
        webSocket.onerror = (error) => {
            console.error("WebSocket error:", error);
            webSocket.close();
        };

        setWs(webSocket);
    }, [url]);

    useEffect(() => {
        connect();

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [connect, ws]);

    return data;
};