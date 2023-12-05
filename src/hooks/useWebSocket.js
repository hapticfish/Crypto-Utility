import { useState, useEffect } from "react";

const useWebSocket = (url) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onopen = () => console.log("WebSocket connected");
        ws.onmessage = (e) => setData(JSON.parse(e.data));
        ws.onclose = () => console.log("WebSocket disconnected");

        return () => ws.close();
    }, [url]);

    return data;
};
