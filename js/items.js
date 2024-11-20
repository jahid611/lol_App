document.addEventListener('DOMContentLoaded', () => {
    const itemsList = document.getElementById('itemsList');
    const categoriesList = document.getElementById('categoriesList');
    const searchBar = document.getElementById('searchBar');
    const categoryFilter = document.getElementById('categoryFilter');
    const modal = document.getElementById('itemModal');
    const itemDetails = document.getElementById('itemDetails');
    let allItems = [];
    let activeItem = null;

    const categories = {
        'AttackDamage': 'Dégâts d\'attaque',
        'AttackSpeed': 'Vitesse d\'attaque',
        'CriticalStrike': 'Coup critique',
        'Armor': 'Armure',
        'SpellBlock': 'Résistance magique',
        'HealthRegen': 'Régénération de vie',
        'ManaRegen': 'Régénération de mana',
        'NonbootsMovement': 'Mouvement',
        'Boots': 'Bottes',
        'AbilityPower': 'Puissance',
        'CooldownReduction': 'Réduction de temps de recharge',
        'OnHit': 'Effets à l\'impact',
        'Health': 'Santé',
        'Mana': 'Mana',
        'LifeSteal': 'Vol de vie',
        'SpellVamp': 'Omnivampirisme'
    };

    const statIcons = {
        FlatPhysicalDamageMod: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsattackdamageicon.png',
        FlatMagicDamageMod: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsabilitypowericon.png',
        PercentAttackSpeedMod: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsattackspeedicon.png',
        FlatHPPoolMod: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodshealthscalingicon.png',
        FlatSpellBlockMod: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsmagicresicon.png',
        FlatArmorMod: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/statmodsarmoricon.png',
        PercentMovementSpeedMod: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/resolve/veteranaftershock/veteranaftershock.png',
        FlatCritChanceMod: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/precision/lethaltempotemporary/lethaltempotemporary.png'
    };

    const statNames = {
        FlatPhysicalDamageMod: 'Dégâts d\'attaque',
        FlatMagicDamageMod: 'Puissance',
        PercentAttackSpeedMod: 'Vitesse d\'attaque',
        FlatHPPoolMod: 'Santé',
        FlatSpellBlockMod: 'Résistance magique',
        FlatArmorMod: 'Armure',
        PercentMovementSpeedMod: 'Vitesse de déplacement',
        FlatCritChanceMod: 'Chance de coup critique',
    };

    async function fetchItems() {
        try {
            const response = await fetch('https://ddragon.leagueoflegends.com/cdn/13.10.1/data/fr_FR/item.json');
            if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
            const data = await response.json();

            allItems = Object.entries(data.data)
                .filter(([id, item]) => {
                    return item.gold && item.gold.total > 0 && 
                           item.maps && item.maps['11'] && 
                           !item.tags.includes('Jungle') && 
                           !item.tags.includes('Lane') && 
                           !item.description.includes('Teamfight Tactics') && 
                           !item.requiredChampion;
                })
                .map(([id, item]) => ({ id, ...item }));

            populateCategoryFilter();
            displayCategories();
            displayItems(allItems);
        } catch (error) {
            console.error('Erreur lors du chargement des items :', error);
        }
    }

    function populateCategoryFilter() {
        const uniqueTags = new Set();
        allItems.forEach(item => {
            if (item.tags) item.tags.forEach(tag => uniqueTags.add(tag));
        });

        const fragment = document.createDocumentFragment();
        Array.from(uniqueTags).sort().forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            fragment.appendChild(option);
        });
        
        categoryFilter.innerHTML = '<option value="">Toutes les catégories</option>';
        categoryFilter.appendChild(fragment);
    }

    function displayCategories() {
        const fragment = document.createDocumentFragment();
        Object.entries(categories).forEach(([key, value]) => {
            const button = document.createElement('button');
            button.textContent = value;
            button.className = 'category-button';
            button.dataset.category = key;
            button.addEventListener('click', () => filterItemsByCategory(key));
            fragment.appendChild(button);
        });
        categoriesList.appendChild(fragment);
    }

    function filterItemsByCategory(category) {
        const buttons = document.querySelectorAll('.category-button');
        buttons.forEach(button => button.classList.remove('active'));
        const activeButton = document.querySelector(`.category-button[data-category="${category}"]`);
        if (activeButton) activeButton.classList.add('active');

        const filteredItems = allItems.filter(item => item.tags && item.tags.includes(category));
        displayItems(filteredItems);
    }

    function displayItems(items) {
        const fragment = document.createDocumentFragment();
        items.forEach(item => {
            const itemCard = createItemCard(item);
            fragment.appendChild(itemCard);
        });
        itemsList.innerHTML = '';
        itemsList.appendChild(fragment);
    }

    function createItemCard(item) {
        const card = document.createElement('div');
        card.classList.add('item-card');
        card.innerHTML = `
            <img src="https://ddragon.leagueoflegends.com/cdn/13.10.1/img/item/${item.image.full}" alt="${item.name}" title="${item.name}" loading="lazy">
        `;

        card.addEventListener('mouseenter', (e) => showItemDetails(item, e.currentTarget, e));
        card.addEventListener('mouseleave', hideModal);

        return card;
    }

    function showItemDetails(item, element, e) {
        if (activeItem === item) return;
        activeItem = item;
        updateModalContent(item);
        showModal(element);
        e?.stopPropagation();
    }

    function updateModalContent(item) {
        const { name, description, gold, stats, from, into } = item;
        
        const formattedDescription = description.replace(/<.*?>/g, '');
        
        let statsHtml = '';
        if (stats) {
            statsHtml = `<div class="stats-container">` + 
                Object.entries(stats).map(([stat, value]) => `
                    <div class="stat-line">${formatStat(stat, value)}</div>
                `).join('') + 
                `</div>`;
        }

        let recipeHtml = '';
        if (from && from.length > 0) {
            recipeHtml = `
                <div class="recipe">
                    <div class="recipe-title">Recette:</div>
                    <div class="recipe-items">
                        ${from.map(componentId => `
                            <img src="https://ddragon.leagueoflegends.com/cdn/13.10.1/img/item/${allItems.find(i => i.id === componentId)?.image.full}" 
                                 alt="${allItems.find(i => i.id === componentId)?.name}"
                                 title="${allItems.find(i => i.id === componentId)?.name}">
                        `).join('')}
                    </div>
                    <div class="remaining-cost">Coût restant: ${calculateRemainingCost(item)} or</div>
                </div>
            `;
        }

        let transformsHtml = '';
        if (into && into.length > 0) {
            transformsHtml = `
                <div class="transforms">
                    <div class="transforms-title">Se transforme en:</div>
                    <div class="transform-items">
                        ${into.map(transformId => `
                            <img src="https://ddragon.leagueoflegends.com/cdn/13.10.1/img/item/${allItems.find(i => i.id === transformId)?.image.full}"
                                 alt="${allItems.find(i => i.id === transformId)?.name}"
                                 title="${allItems.find(i => i.id === transformId)?.name}">
                        `).join('')}
                    </div>
                </div>
            `;
        }

        itemDetails.innerHTML = `
            <h2>${name}</h2>
            <img src="https://ddragon.leagueoflegends.com/cdn/13.10.1/img/item/${item.image.full}" 
                 alt="${name}" 
                 class="main-image">
            ${statsHtml}
            <p>${formattedDescription}</p>
            <div class="gold-info">Prix: ${gold.total} or</div>
            ${recipeHtml}
            ${transformsHtml}
        `;
    }

    function showModal(element) {
        const rect = element.getBoundingClientRect();
        const modalContent = modal.querySelector('.modal-content');
    
        let left = rect.right + 5;
        let top = rect.top;
    
        if (left + modalContent.offsetWidth > window.innerWidth) {
            left = rect.left - modalContent.offsetWidth - 5;
        }
    
        if (top + modalContent.offsetHeight > window.innerHeight) {
            top = window.innerHeight - modalContent.offsetHeight;
        }
    
        modalContent.style.left = `${left}px`;
        modalContent.style.top = `${top}px`;
        
        modal.classList.add('visible');
    }

    function hideContent() {
        modal.classList.remove('modal');
        activeItem = null;
    }

    function hideModal() {
        modal.classList.remove('modal');
        activeItem = null;
    }

function handleOutsideClick(event) {
    console.log("Click détecté");
    if (modal.classList.contains('visible')) {
        console.log("Modal est visible");
        if (!modal.querySelector('.modal-content').contains(event.target)) {
            console.log("Clic en dehors du modal, fermeture...");
            hideModal('.modal-content');
        }
    }
}

    function formatStat(stat, value) {
        const formattedValue = stat.startsWith('Percent') ? `${(value * 100).toFixed(0)}%` : value;
        const iconUrl = statIcons[stat] || '';
        const iconHtml = iconUrl ? `<img src="${iconUrl}" class="stat-icon" alt="">` : '';
        return `${iconHtml} ${statNames[stat] || stat}: ${formattedValue}`;
    }

    function calculateRemainingCost(item) {
        if (!item.from) return 0;
        const componentsCost = item.from.reduce((total, componentId) => {
            const component = allItems.find(i => i.id === componentId);
            return total + (component ? component.gold.total : 0);
        }, 0);
        return item.gold.total - componentsCost;
    }

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    searchBar.addEventListener('input', debounce(() => {
        const searchTerm = searchBar.value.toLowerCase();
        const filteredItems = allItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            item.description.toLowerCase().includes(searchTerm)
        );
        displayItems(filteredItems);
    }, 300));

    categoryFilter.addEventListener('change', () => {
        const selectedCategory = categoryFilter.value;
        const filteredItems = selectedCategory 
            ? allItems.filter(item => item.tags && item.tags.includes(selectedCategory))
            : allItems;
        displayItems(filteredItems);
    });

    document.addEventListener('click', handleOutsideClick);

    fetchItems();
});