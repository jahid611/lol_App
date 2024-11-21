document.addEventListener('DOMContentLoaded', () => {
    const championsList = document.getElementById('championsList');
    const championSearch = document.getElementById('championSearch');
    const roleFilter = document.getElementById('roleFilter');
    const modal = document.getElementById('championModal');
    let allChampions = [];

    async function fetchChampions() {
        try {
            const response = await fetch('https://ddragon.leagueoflegends.com/cdn/14.23.1/data/fr_FR/champion.json');
            const data = await response.json();
            allChampions = Object.values(data.data);
            displayChampions(allChampions);
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    function createStatsChart(canvas, stats) {
        return new Chart(canvas, {
            type: 'radar',
            data: {
                labels: ['Dégâts', 'Tankiness', 'CC', 'Vitesse', 'Régénération', 'Mobilité'],  // Mises à jour des catégories
                datasets: [{
                    data: [stats.damage, stats.tankiness, stats.cc, stats.speed, stats.regeneration, stats.mobility], // Remplir avec les bonnes valeurs
                    backgroundColor: 'rgba(255, 99, 132, 0.2)', // Couleur de fond avec une légère transparence
                    borderColor: 'rgba(255, 99, 132, 1)',  // Couleur de la bordure
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)', // Couleur des points du radar
                    pointBorderColor: 'rgba(255, 99, 132, 1)',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
                }]
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true,  // Commencer le radar à zéro
                        max: 10,  // Limite de l'axe
                        ticks: {
                            display: false // Cacher les ticks pour un rendu plus propre
                        },
                        grid: {
                            color: 'rgba(200, 170, 110, 0.1)' // Couleur de la grille
                        },
                        pointLabels: {
                            color: '#F0E6D2' // Couleur des labels (noms des statistiques)
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // Masquer la légende
                    }
                },
                elements: {
                    line: {
                        tension: 0.3 // Courbe de la ligne
                    }
                }
            }
        });
    }
    

    function displayChampions(champions) {
        championsList.innerHTML = champions.map(champion => `
            <div class="champion-card" data-champion-id="${champion.id}">
                <img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg" 
                     alt="${champion.name}">
                <div class="champion-info">
                    <h3>${champion.name}</h3>
                    <p>${champion.title}</p>
                </div>
                <div class="champion-stats">
                    <canvas class="stats-chart"></canvas>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.champion-card').forEach(card => {
            const canvas = card.querySelector('.stats-chart');
            const championId = card.dataset.championId;
            const champion = champions.find(c => c.id === championId);
            createStatsChart(canvas, champion.info);

            card.addEventListener('click', () => showChampionDetails(championId));
        });
    }

    async function showChampionDetails(championId) {
        try {
            const normalizedChampionId = championId.replace(/[^a-zA-Z0-9]/g, '');
            const championKey = Object.keys(championsData).find(key => key.replace(/[^a-zA-Z0-9]/g, '') === normalizedChampionId);
    
            if (!championKey) {
                console.error(`Champion non trouvé dans championsData: ${championId}`);
                return;
            }
    
            const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/14.23.1/data/fr_FR/champion/${championKey}.json`);
            const data = await response.json();
            const champion = data.data[championKey];
    
            const modal = document.getElementById('championModal');
            modal.classList.add('active');
    
            document.getElementById('championDetails').innerHTML = `
                <div class="champion-header" style="background-image: url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championKey}_0.jpg')">
                    <div class="champion-header-content">
                        <h1 class="champion-title">${champion.title}</h1>
                        <h2 class="champion-name">${champion.name}</h2>
                    </div>
                </div>
    
                <div class="champion-info-section">
                    <p>${champion.lore}</p>
                </div>
    
                <div class="champion-info-section">
                    <h3 class="section-title">Compétences</h3>
                    <div class="abilities-container">
                        <div class="abilities">
                            <div class="ability passive" data-ability="passive">
                                <img src="https://ddragon.leagueoflegends.com/cdn/14.23.1/img/passive/${champion.passive.image.full}" 
                                     alt="${champion.passive.name}">
                                <span class="ability-key">P</span>
                            </div>
                            ${champion.spells.map((spell, index) => `
                                <div class="ability" data-ability="${index}">
                                    <img src="https://ddragon.leagueoflegends.com/cdn/14.23.1/img/spell/${spell.image.full}"
                                         alt="${spell.name}">
                                    <span class="ability-key">${['Q', 'W', 'E', 'R'][index]}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="ability-preview">
                            <div class="ability-video">
                                <video autoplay loop muted>
                                    <source src="" type="video/webm">
                                </video>
                            </div>
                            <div class="ability-description">
                                <h4 class="ability-name"></h4>
                                <p class="ability-text"></p>
                                <div class="ability-stats"></div>
                            </div>
                        </div>
                    </div>
                </div>
    
                <div class="champion-info-section">
                    <h3 class="section-title">Skins disponibles</h3>
                    <div class="skins-section">
                        <div class="skin-preview"></div>
                        <div class="skin-thumbnails">
                            ${champion.skins.map(skin => `
                                <img class="skin-thumbnail" 
                                     src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championKey}_${skin.num}.jpg"
                                     alt="${skin.name === 'default' ? champion.name : skin.name}"
                                     data-skin-id="${skin.num}">
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
    
            // Initialize the first skin
            const firstSkin = champion.skins[0];
            updateSkinPreview(championKey, firstSkin.num, firstSkin.name);
    
            // Event handlers for skin thumbnails
            document.querySelectorAll('.skin-thumbnail').forEach(thumbnail => {
                thumbnail.addEventListener('click', (e) => {
                    const skinId = e.target.dataset.skinId;
                    const skinName = champion.skins.find(s => s.num === parseInt(skinId)).name;
                    updateSkinPreview(championKey, skinId, skinName);
                    
                    document.querySelectorAll('.skin-thumbnail').forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                });
            });
    
            document.querySelector('.close-button').addEventListener('click', () => {
                modal.classList.remove('active');
            });
    
            // Event handlers for abilities
            document.querySelectorAll('.ability').forEach(ability => {
                ability.addEventListener('click', (e) => {
                    const abilityIndex = e.currentTarget.dataset.ability;
                    const abilityData = abilityIndex === 'passive' ? champion.passive : champion.spells[abilityIndex];
                    updateAbilityPreview(championKey, abilityIndex, abilityData);
                });
            });
    
            // Initialize with the passive ability
            updateAbilityPreview(championKey, 'passive', champion.passive);
    
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error('Erreur:', error);
        }
    }
    
    function updateAbilityPreview(championKey, abilityIndex, abilityData) {
        const previewContainer = document.querySelector('.ability-preview');
        const videoElement = previewContainer.querySelector('video');
        const descriptionElement = previewContainer.querySelector('.ability-description');
        const statsElement = previewContainer.querySelector('.ability-stats');
    
        // Update video source
        const champId = championsData[championKey];
        const abilityKey = abilityIndex === 'passive' ? 'P1' : ['Q1', 'W1', 'E1', 'R1'][abilityIndex];
        const videoUrl = `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${champId}/ability_${champId}_${abilityKey}.mp4`;
        videoElement.src = videoUrl;
    
        // Update ability name and description
        descriptionElement.querySelector('.ability-name').textContent = abilityData.name;
        descriptionElement.querySelector('.ability-text').textContent = abilityData.description;
    
        // Update ability stats
        let statsHtml = '';
        if (abilityIndex !== 'passive') {
            const spell = abilityData;
            statsHtml += `<p><strong>Coût:</strong> ${spell.costBurn}</p>`;
            statsHtml += `<p><strong>Temps de recharge:</strong> ${spell.cooldownBurn}</p>`;
            if (spell.rangeBurn !== "self") {
                statsHtml += `<p><strong>Portée:</strong> ${spell.rangeBurn}</p>`;
            }
        }
        statsElement.innerHTML = statsHtml;
    }
    
    function updateSkinPreview(championId, skinId, skinName) {
        const skinPreview = document.querySelector('.skin-preview');
        skinPreview.style.backgroundImage = `url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skinId}.jpg)`;
        
        const skinTitle = document.createElement('h3');
        skinTitle.className = 'skin-title';
        skinTitle.textContent = skinName;
        skinPreview.innerHTML = '';
        skinPreview.appendChild(skinTitle);
    }
    
    

    function updateSkinPreview(championId, skinId, skinName) {
        const skinPreview = document.querySelector('.skin-preview');
        skinPreview.style.backgroundImage = `url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skinId}.jpg)`;
        
        const skinTitle = document.querySelector('.skin-title');
        if (!skinTitle) {
            const title = document.createElement('h3');
            title.className = 'skin-title';
            skinPreview.appendChild(title);
        }
        document.querySelector('.skin-title').textContent = skinName;
    }

    function updateAbilityPreview(championId, abilityIndex, abilityData) {
        const previewContainer = document.querySelector('.ability-preview');
        
        // Récupération de l'ID du champion depuis champ-data.js

        // Récupérer l'ID du champion à partir de champ-data.js
        const champId = championsData[championId];
    
        // Définir l'URL en fonction de l'abilityIndex (Q, W, E, R, P)
        let abilityKey = '';
        if (abilityIndex === 'passive') {
            abilityKey = 'P1';  // Passif
        } else {
            switch (abilityIndex) {
                case '0': abilityKey = 'Q1'; break;
                case '1': abilityKey = 'W1'; break;
                case '2': abilityKey = 'E1'; break;
                case '3': abilityKey = 'R1'; break;
                default: abilityKey = 'Q1'; break;
            }
        }
    
        // Générer l'URL vidéo avec l'ID du champion et la compétence choisie
        const videoUrl = `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${champId}/ability_${champId}_${abilityKey}.mp4`;
    
        // Log de l'URL pour le débogage
        console.log("URL générée pour la vidéo de l'abilité:", videoUrl);
    
        previewContainer.innerHTML = `
            <video autoplay loop muted>
                <source src="${videoUrl}" type="video/mp4">
            </video>
            <div class="ability-description">
                <h4>${abilityData.name}</h4>
                <p>${abilityData.description}</p>
            </div>
        `;
    }
    
    
    
    

    document.querySelector('.close-button').addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    championSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredChampions = allChampions.filter(champion => 
            champion.name.toLowerCase().includes(searchTerm)
        );
        displayChampions(filteredChampions);
    });

    roleFilter.addEventListener('change', (e) => {
        const selectedRole = e.target.value;
        const filteredChampions = selectedRole 
            ? allChampions.filter(champion => champion.tags.includes(selectedRole))
            : allChampions;
        displayChampions(filteredChampions);
    });

    fetchChampions();
});