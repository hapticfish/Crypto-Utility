
//TODO add context for websocket and retriving tickers and anything else
//TODO implament fetch ticker data function
//TODO finish intagrating go with react ticker stuff

import '../index.css';
import React, {useContext, useEffect, useState} from "react";

import { TickerContext } from "../contexts/TickerContext";
import { WebSocketContext } from "../contexts/WebSocketContext";

import HomeLogo from './HomeLogo';
import GeneralAppFooter from "./GeneralAppFooter";
import useWebSocket from "../hooks/useWebSocket";

const HomePage = () => {
    const {tickers, previousTickers } = useContext(TickerContext);
    const { subscribe, unsubscribe, data, isLoading } = useContext(WebSocketContext);
    const [showLoading, setShowLoading] = useState(true);// State to manage loading indicators


    useEffect(() => {
        subscribe();
        console.log("WebSocket subscribed");
        console.log("Data from WebSocketContext:", data); // Logging data from context

        console.log("Is Loading:", isLoading);
        return () => {
            unsubscribe();
            console.log("WebSocket unsubscribed");
        }
    }, [subscribe, unsubscribe, data, isLoading]);



    console.log("Tickers:", tickers);
    console.log("Previous Tickers", previousTickers);



    // Timeout for loading state
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLoading(false);
        }, 5000);

        // Clean up the timer when the component is unmounted or if the loading state changes
        return () => clearTimeout(timer);
    }, []);

    //debugging for tickers
    useEffect(() => {
        console.log("Current tickers: ", tickers);
        if (Object.keys(tickers).length > 0) {
            setShowLoading(false);
        }
    }, [tickers])

    return (
        <div className="home-page-grid-container">
            <div className="home-logo-cont">
                <HomeLogo />
            </div>
            <div className="home-title-cont">
                <p>Crypto Util</p>
            </div>
            <div className="home-calc-cont">
                <button className="nav-button">Calculators</button>
                <button className="nav-button">Accounting</button>
            </div>
            <div className="home-ticker-title-cont">
                <p>Tickers</p>
            </div>
            <div className="home-ticker-cont">
                {showLoading && isLoading ? (
                    <div className="loading-dots">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                ) : tickers && Object.keys(tickers).length > 0 ? (
                    Object.entries(tickers).map(([tickerName, tickerValue]) => {
                        const previousValue = previousTickers[tickerName];
                        let className = 'ticker-value';
                        if (typeof previousValue === 'number') {
                            className += tickerValue > previousValue ? ' ticker-up' : ' ticker-down';
                        }
                        return <p key={tickerName} className={className}>{tickerName}: {tickerValue}</p>;
                    })
                ) : (
                    <p>{!isLoading ? 'Failed to load tickers.' : 'No ticker data available.'}</p>
                )}
            </div>
            <div className="footer-styling">
                <GeneralAppFooter />
            </div>
        </div>
    );
};

export default HomePage