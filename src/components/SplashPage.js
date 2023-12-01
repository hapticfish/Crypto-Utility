import React from 'react';
import '../index.css';

import SplashFooter from './SplashFooter';
import SplashLogo from './SplashLogo';

const SplashPage = () => {
    return (
        <div className="splash-page-grid-container">
            <div className="splash-logo">
                <SplashLogo />
            </div>
            <div className="splash-footer">
                <SplashFooter />
            </div>
        </div>
    );
};

export default SplashPage