document.addEventListener('DOMContentLoaded', () => {
    const championsList = document.getElementById('championsList');
    const championSearch = document.getElementById('championSearch');
    const roleFilter = document.getElementById('roleFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    const modal = document.getElementById('championModal');
    const closeButton = modal.querySelector('.close-button');
    let allChampions = [];

    async function fetchChampions() {
        try {
            const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${config.ddragonVersion}/data/${config.ddragonLang}/champion.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allChampions = Object.values(data.data);
            console.log(`Nombre total de champions chargés : ${allChampions.length}`);
            displayChampions(allChampions);
        } catch (error) {
            console.error('Erreur lors de la récupération des champions:', error);
            championsList.innerHTML = '<p class="error">Erreur lors du chargement des champions. Veuillez réessayer plus tard.</p>';
        }
    }

    function displayChampions(champions) {
        championsList.innerHTML = champions.map(champion => `
            <div class="champion-card" data-champion-id="${champion.id}">
                <img 
                    src="https://ddragon.leagueoflegends.com/cdn/${config.ddragonVersion}/img/champion/${champion.image.full}" 
                    alt="${champion.name}"
                    loading="lazy"
                    onerror="this.onerror=null; this.src='/assets/images/champion-placeholder.png';"
                >
                <div class="champion-info">
                    <p class="champion-name">${champion.name}</p>
                    <p class="champion-roles">${champion.tags.join(', ')}</p>
                </div>
                <div class="champion-stats">
                    <p>Attaque: ${champion.info.attack}</p>
                    <p>Défense: ${champion.info.defense}</p>
                    <p>Magie: ${champion.info.magic}</p>
                    <p>Difficulté: ${champion.info.difficulty}</p>
                </div>
            </div>
        `).join('');

        championsList.querySelectorAll('.champion-card').forEach(card => {
            card.addEventListener('click', () => showChampionDetails(card.dataset.championId));
        });
    }

    async function showChampionDetails(championId) {
        try {
            const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${config.ddragonVersion}/data/${config.ddragonLang}/champion/${championId}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const champion = data.data[championId];

            const modalContent = document.getElementById('championDetails');
            modalContent.innerHTML = `
                <div class="champion-details">
                    <div class="champion-header">
                        <img src="https://ddragon.leagueoflegends.com/cdn/${config.ddragonVersion}/img/champion/${champion.image.full}" alt="${champion.name}" class="champion-portrait">
                        <div>
                            <h2>${champion.name}</h2>
                            <p class="champion-title">${champion.title}</p>
                        </div>
                    </div>
                    <p class="champion-lore">${champion.lore}</p>
                    <div class="champion-abilities">
                        ${champion.spells.map((spell, index) => `
                            <div class="ability">
                                <img src="https://ddragon.leagueoflegends.com/cdn/${config.ddragonVersion}/img/spell/${spell.image.full}" alt="${spell.name}">
                                <p>${['Q', 'W', 'E', 'R'][index]}</p>
                            </div>
                        `).join('')}
                    </div>
                    <h3>Skins</h3>
                    <div class="champion-skins">
                        ${champion.skins.map(skin => `
                            <div class="skin-preview">
                                <img src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${skin.num}.jpg" alt="${skin.name}" loading="lazy">
                                <p>${skin.name}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            modal.classList.remove('hidden');
        } catch (error) {
            console.error('Erreur lors de la récupération des détails du champion:', error);
        }
    }

    function filterChampions() {
        const searchTerm = championSearch.value.toLowerCase();
        const selectedRole = roleFilter.value;
        const selectedDifficulty = difficultyFilter.value;

        const filteredChampions = allChampions.filter(champion => {
            const nameMatch = champion.name.toLowerCase().includes(searchTerm);
            const roleMatch = !selectedRole || champion.tags.includes(selectedRole);
            const difficultyMatch = !selectedDifficulty || 
                (selectedDifficulty === '1' && champion.info.difficulty <= 3) ||
                (selectedDifficulty === '2' && champion.info.difficulty > 3 && champion.info.difficulty <= 7) ||
                (selectedDifficulty === '3' && champion.info.difficulty > 7);
            return nameMatch && roleMatch && difficultyMatch;
        });

        displayChampions(filteredChampions);
    }

    championSearch.addEventListener('input', filterChampions);
    roleFilter.addEventListener('change', filterChampions);
    difficultyFilter.addEventListener('change', filterChampions);
    closeButton.addEventListener('click', () => modal.classList.add('hidden'));

    fetchChampions();
});