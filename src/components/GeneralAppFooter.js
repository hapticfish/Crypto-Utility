import React, {useEffect, useState} from 'react'

import useGitHubLastUpdated from "../hooks/useGitHubLastUpdated";

const GeneralAppFooter = () => {

    const lastUpdated = useGitHubLastUpdated('hapticfish/Crypto-Utility');


    return (
        <div className="footer-styling">
            <p>© {lastUpdated}</p>
        </div>
    );
};

export default GeneralAppFooter