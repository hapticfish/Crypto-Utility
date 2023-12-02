import { useState, useEffect } from 'react';

const useGitHubLastUpdated = (repoPath) => {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        const fetchLastUpdated = async () => {
            try {
                // Use the repoPath variable instead of hardcoding the URL
                const response = await fetch(`https://api.github.com/repos/${repoPath}`);
                const data = await response.json();
                const lastUpdatedDate = new Date(data.pushed_at).toLocaleDateString();
                setLastUpdated(lastUpdatedDate);
            } catch (error) {
                console.error('Error fetching last updated date:', error);
            }
        };
        fetchLastUpdated();
    }, [repoPath]); // Correctly using repoPath variable here

    return lastUpdated;
};

export default useGitHubLastUpdated;
