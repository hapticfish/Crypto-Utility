
//TODO add context for websocket and retriving tickers and anything else
//TODO implament fetch ticker data function
//TODO finish intagrating go with react ticker stuff

import '../index.css';
import React, { useContext } from "react";

import { TickerContext } from "../contexts/TickerContext";
import { WebSocketContext } from "../contexts/WebSocketContext";

import HomeLogo from './HomeLogo';
import GeneralAppFooter from "./GeneralAppFooter";


const HomePage = () => {
    const {tickers, previousTickers } = useContext(TickerContext);
    const webSocketData = useContext(WebSocketContext);

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
                {Object.entries(tickers).map(([key, value]) => {
                    const previousValue = previousTickers[key];
                    let className = 'ticker-value';
                    if (previousValue != null) {
                        className += value > previousValue ? 'ticker-up' : 'ticker-down';
                    }

                    return <p key={key} className={className}>{key}: {value}</p>;
                })}
                }
            </div>
            <div className="footer-styling">
                <GeneralAppFooter />
            </div>
        </div>
    );
};

export default HomePage