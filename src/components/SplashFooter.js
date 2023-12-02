import React, {useEffect, useState} from 'react'

import useGitHubLastUpdated from "../hooks/useGitHubLastUpdated";

const SplashFooter = () => {
    const lastUpdated = useGitHubLastUpdated('hapticfish/Crypto-Utility');



    return (
        <div className="footer-styling">
            <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
            </div>
            <p>© {lastUpdated}</p>
        </div>

    );
};

export default SplashFooter;