
import useGitHubLastUpdated from "../hooks/useGitHubLastUpdated";

const GeneralAppFooter = () => {

    const lastUpdated = useGitHubLastUpdated('hapticfish/Crypto-Utility');


    return (
        <div className="gen-app-foot-style">
            <p>© {lastUpdated}</p>
        </div>
    );
};

export default GeneralAppFooter