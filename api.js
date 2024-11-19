async function fetchFromRiotAPI(endpoint, region) {
    const url = getRiotApiUrl(endpoint, region);
    const response = await fetch(url, {
        headers: {
            'X-Riot-Token': config.apiKey
        }
    });
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }
    return response.json();
}

async function getPlayerPUUID(gameName, tagLine, region) {
    const endpoint = `riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    return fetchFromRiotAPI(endpoint, region);
}

async function getPlayerInfo(puuid, region) {
    const endpoint = `lol/summoner/v4/summoners/by-puuid/${puuid}`;
    return fetchFromRiotAPI(endpoint, config.regions[region]);
}

async function getPlayerRanks(summonerId, region) {
    const endpoint = `lol/league/v4/entries/by-summoner/${summonerId}`;
    return fetchFromRiotAPI(endpoint, config.regions[region]);
}

async function getPlayerMatchHistory(puuid, region, count = 20) {
    const endpoint = `lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`;
    return fetchFromRiotAPI(endpoint, region);
}

async function getMatchDetails(matchId, region) {
    const endpoint = `lol/match/v5/matches/${matchId}`;
    return fetchFromRiotAPI(endpoint, region);
}