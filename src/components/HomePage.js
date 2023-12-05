
import '../index.css';
import React, { useState, useEffect} from "react";

import HomeLogo from './HomeLogo';
import GeneralAppFooter from "./GeneralAppFooter";


const HomePage = () => {

    const [tickers, setTickers] = useState({});
    const [previousTickers, setPreviousTickers] = useState({});

    useEffect(() => {
        const fetchTickers = async () => {
            // Fetch the ticker date from API
            const newData = await getTickerDataFromAPI(); // replace with API call
            setPreviousTickers(tickers);
            setTickers(newData);
        };

        fetchTickers();
        const intervalId = setInterval(fetchTickers, 60000); //fetch every 60s
         return () => clearInterval(intervalId); //Clear interval on compnoent unmount
    }, [tickers]);

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
                    if (previousValue) {
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