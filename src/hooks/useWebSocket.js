import { useState, useEffect } from "react";

const useWebSocket = (url) => {
    const [data, setData] = useState({});

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onopen = () => console.log("WebSocket connected");
        ws.onmessage = (e) => {
            const message = JSON.parse(e.data);
            setData(message);
        };
        ws.onclose = () => console.log("WebSocket disconnected");

        return () => ws.close();
    }, [url]);

    return data;
};