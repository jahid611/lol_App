document.addEventListener('DOMContentLoaded', () => {
    const championsList = document.getElementById('championsList');
    const championSearch = document.getElementById('championSearch');
    const roleFilter = document.getElementById('roleFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    const modal = document.getElementById('championModal');
    const spellVideoModal = document.getElementById('spellVideoModal');
    const closeButtons = document.querySelectorAll('.close-button');
    let allChampions = [];

    async function fetchChampions() {
        try {
            const response = await fetch(getDdragonUrl(`data/${config.ddragonLang}/champion.json`));
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            allChampions = Object.values(data.data);
            displayChampions(allChampions);
        } catch (error) {
            console.error('Erreur lors de la récupération des champions:', error);
            championsList.innerHTML = '<p class="error">Erreur lors du chargement des champions. Veuillez réessayer plus tard.</p>';
        }
    }

    function displayChampions(champions) {
        if (!champions || champions.length === 0) {
            championsList.innerHTML = '<p>Aucun champion trouvé.</p>';
            return;
        }

        championsList.innerHTML = champions.map(champion => `
            <div class="champion-card" data-champion-id="${champion.id}">
                <img 
                    src="${getDdragonUrl(`img/champion/${champion.image.full}`)}" 
                    alt="${champion.name}"
                    onerror="this.onerror=null; this.src='placeholder.png';"
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
            const response = await fetch(getDdragonUrl(`data/${config.ddragonLang}/champion/${championId}.json`));
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const champion = data.data[championId];
    
            const modalContent = document.getElementById('championDetails');
            modalContent.innerHTML = `
                <div class="champion-details">
                    <div class="champion-header">
                        <img src="${getDdragonUrl(`img/champion/${champion.image.full}`)}" 
                             alt="${champion.name}" 
                             class="champion-portrait">
                        <div>
                            <h2>${champion.name}</h2>
                            <p class="champion-title">${champion.title}</p>
                        </div>
                    </div>
                    <p class="champion-lore">${champion.lore}</p>
                    <div class="champion-abilities">
                        <div class="ability passive" data-spell-id="passive">
                            <img src="${getDdragonUrl(`img/passive/${champion.passive.image.full}`)}" 
                                 alt="${champion.passive.name}"
                                 title="${champion.passive.name}">
                            <p>Passive</p>
                        </div>
                        ${champion.spells.map((spell, index) => `
                            <div class="ability" data-spell-id="${['Q', 'W', 'E', 'R'][index]}">
                                <img src="${getDdragonUrl(`img/spell/${spell.image.full}`)}" 
                                     alt="${spell.name}"
                                     title="${spell.name}">
                                <p>${['Q', 'W', 'E', 'R'][index]}</p>
                            </div>
                        `).join('')}
                    </div>
                    <h3>Skins</h3>
                    <div class="champion-skins">
                        ${champion.skins.map(skin => `
                            <div class="skin-preview">
                                <img src="${config.ddragonBaseUrl}/img/champion/splash/${champion.id}_${skin.num}.jpg" 
                                     alt="${skin.name === 'default' ? champion.name : skin.name}" 
                                     loading="lazy">
                                <p>${skin.name === 'default' ? champion.name : skin.name}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
    
            modal.classList.remove('hidden');
    
            modalContent.querySelectorAll('.ability').forEach(ability => {
                ability.addEventListener('click', () => showSpellVideo(champion.name, ability.dataset.spellId));
            });
        } catch (error) {
            console.error('Error fetching champion details:', error);
            alert('Error loading champion details. Please try again later.');
        }
    }

    async function showSpellVideo(championName, spellId) {
        const championId = championsData[championName];
    
        if (!championId) {
            console.error(`Champion ID not found for: ${championName}`);
            alert(`Champion "${championName}" not recognized.`);
            return;
        }
    
        let spellSuffix;
        if (spellId === 'passive') {
            spellSuffix = 'P1';
        } else {
            spellSuffix = {
                'Q': 'Q1',
                'W': 'W1',
                'E': 'E1',
                'R': 'R1'
            }[spellId] || 'Q1'; // Default to Q1 if somehow an invalid spellId is passed
        }
    
        const videoUrl = `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${championId}/ability_${championId}_${spellSuffix}.mp4`;
    
        const spellVideoContainer = document.getElementById('spellVideoContainer');
        spellVideoContainer.innerHTML = `
            <video controls autoplay loop>
                <source src="${videoUrl}" type="video/mp4">
                Your browser does not support video playback.
            </video>
        `;
    
        const video = spellVideoContainer.querySelector('video');
        
        video.onerror = function() {
            console.error(`Failed to load video for ${championName} ${spellId}`);
            spellVideoContainer.innerHTML = `
                <p>Sorry, the video for this ability is not available.</p>
                <p>Attempted URL: ${videoUrl}</p>
            `;
        };
    
        // Show the video modal
        const spellVideoModal = document.getElementById('spellVideoModal');
        spellVideoModal.classList.remove('hidden');
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
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.classList.add('hidden');
            spellVideoModal.classList.add('hidden');
        });
    });
    [modal, spellVideoModal].forEach(modalElement => {
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
                modalElement.classList.add('hidden');
            }
        });
    });

    fetchChampions();
});