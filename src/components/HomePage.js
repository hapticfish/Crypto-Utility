import React from 'react';
import '../index.css';
import SplashLogo from "./SplashLogo";
import SplashFooter from "./SplashFooter";

// import SplashFooter from './SplashFooter';
// import SplashLogo from './SplashLogo';

import HomeLogo from './HomeLogo';
import GeneralAppFooter from "./GeneralAppFooter";


const HomePage = () => {
    return (
        <div className="home-page-grid-container">
            <div className="home-logo-cont">
                <HomeLogo />
            </div>
            <div className="home-title-cont">
                <p>Crypto Util</p>
            </div>
            <div className="home-calc-cont">
                <button className="nav-button"></button>
                <button className="nav-button"></button>
            </div>
            <div className="home-ticker-title-cont">
                <p>Tickers</p>
            </div>
            <div className="home-ticker-cont">
                <p>Tickers1</p>
                <p>Tickers2</p>
                <p>Tickers3</p>
                <p>Tickers4</p>
                <p>Tickers5</p>
                <p>Tickers6</p>
            </div>
            <div className="footer-styling">
                <GeneralAppFooter />
            </div>
        </div>
    );
};

export default HomePage