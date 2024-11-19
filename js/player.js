document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const playerInfo = document.getElementById('playerInfo');
    const matchHistory = document.getElementById('matchHistory');
    const matchList = document.getElementById('matchList');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const gameName = document.getElementById('gameName').value;
        const tagLine = document.getElementById('tagLine').value;
        const region = document.getElementById('region').value;

        try {
            showLoading();
            const accountData = await getPlayerPUUID(gameName, tagLine, region);
            const playerData = await getPlayerInfo(accountData.puuid, region);
            const ranksData = await getPlayerRanks(playerData.id, region);
            const matchIds = await getPlayerMatchHistory(accountData.puuid, region);

            displayPlayerInfo(playerData, ranksData);
            await displayMatchHistory(matchIds, accountData.puuid, region);
            hideLoading();
        } catch (err) {
            showError(err.message);
        }
    });

    function displayPlayerInfo(player, ranks) {
        playerInfo.innerHTML = `
            <div class="player-header">
                <img src="${getDdragonUrl(`img/profileicon/${player.profileIconId}.png`)}" alt="Profile Icon" class="profile-icon">
                <h2>${player.name}</h2>
                <p>Niveau ${player.summonerLevel}</p>
            </div>
            <div class="player-ranks">
                ${ranks.map(rank => `
                    <div class="rank-card">
                        <h3>${formatQueueType(rank.queueType)}</h3>
                        <p>${rank.tier} ${rank.rank}</p>
                        <p>${rank.leaguePoints} LP</p>
                        <p>Victoires: ${rank.wins} / Défaites: ${rank.losses}</p>
                    </div>
                `).join('')}
            </div>
        `;
        playerInfo.classList.remove('hidden');
    }

    async function displayMatchHistory(matchIds, puuid, region) {
        matchList.innerHTML = '';
        for (const matchId of matchIds.slice(0, 10)) {
            const matchData = await getMatchDetails(matchId, region);
            const playerStats = matchData.info.participants.find(p => p.puuid === puuid);
            
            const matchElement = document.createElement('div');
            matchElement.classList.add('match-card');
            matchElement.innerHTML = `
                <div class="match-result ${playerStats.win ? 'victory' : 'defeat'}">
                    ${playerStats.win ? 'Victoire' : 'Défaite'}
                </div>
                <div class="match-champion">
                    <img src="${getDdragonUrl(`img/champion/${playerStats.championName}.png`)}" alt="${playerStats.championName}">
                    <p>${playerStats.championName}</p>
                </div>
                <div class="match-stats">
                    <p>${playerStats.kills}/${playerStats.deaths}/${playerStats.assists}</p>
                    <p>CS: ${playerStats.totalMinionsKilled}</p>
                </div>
                <div class="match-items">
                    ${[0, 1, 2, 3, 4, 5, 6].map(slot => 
                        playerStats[`item${slot}`] ? 
                        `<img src="${getDdragonUrl(`img/item/${playerStats[`item${slot}`]}.png`)}" alt="Item ${slot}">` :
                        '<div class="empty-item"></div>'
                    ).join('')}
                </div>
            `;
            matchList.appendChild(matchElement);
        }
        matchHistory.classList.remove('hidden');
    }

    function formatQueueType(queueType) {
        const queueTypes = {
            'RANKED_SOLO_5x5': 'Solo/Duo',
            'RANKED_FLEX_SR': 'Flex 5v5'
        };
        return queueTypes[queueType] || queueType;
    }

    function showLoading() {
        loading.classList.remove('hidden');
        playerInfo.classList.add('hidden');
        matchHistory.classList.add('hidden');
        error.classList.add('hidden');
    }

    function hideLoading() {
        loading.classList.add('hidden');
    }

    function showError(message) {
        error.textContent = message;
        error.classList.remove('hidden');
        loading.classList.add('hidden');
        playerInfo.classList.add('hidden');
        matchHistory.classList.add('hidden');
    }
});