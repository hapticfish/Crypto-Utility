import React, {useEffect, useState} from 'react'

const SplashFooter = () => {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        const fetchLastUpdated = async () => {
            try {
                const response = await fetch('https://api.github.com/repos/hapticfish/Crypto-Utility');
                const data = await response.json();
                const lastUpdatedDate = new Date(data.pushed_at).toLocaleDateString();
                setLastUpdated(lastUpdatedDate);
            } catch (error) {
                console.error('Error fetching last updated date: ', error);
            }
        };
        fetchLastUpdated();
    }, []);


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