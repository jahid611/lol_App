document.addEventListener('DOMContentLoaded', () => {
    const itemsList = document.getElementById('itemsList');
    const categoriesList = document.getElementById('categoriesList');
    const searchBar = document.getElementById('searchBar');
    const categoryFilter = document.getElementById('categoryFilter');
    const modal = document.getElementById('itemModal');
    const itemDetails = document.getElementById('itemDetails');
    let allItems = [];
    let activeItem = null;
    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;

    const categories = {
        'AttackDamage': 'Dégâts d\'attaque',
        'AttackSpeed': 'Vitesse d\'attaque',
        'CriticalStrike': 'Coup critique',
        'Armor': 'Armure',
        'SpellBlock': 'Résistance magique',
        'HealthRegen': 'Régénération de vie',
        'ManaRegen': 'Régénération de mana',
        'NonbootsMovement': 'Mouvement',
        'AbilityPower': 'Puissance',
        'CooldownReduction': 'Réduction de temps de recharge',
        'Health': 'Santé',
        'Mana': 'Mana',
        'LifeSteal': 'Vol de vie',
        'SpellVamp': 'Omnivampirisme',
        'ArmorPenetration': 'Pénétration d\'armure',
        'MagicPenetration': 'Pénétration magique',
        'Range': 'Portée',
        'Tenacity': 'Ténacité'
    };
      
    const statIcons = {
        FlatPhysicalDamageMod: '/images/STATS/AD.png',
        FlatMagicDamageMod: '/images/STATS/AP.png',
        PercentAttackSpeedMod: '/images/STATS/AS.png',
        FlatHPPoolMod: '/images/STATS/HP.png',
        FlatMPPoolMod: '/images/STATS/MANA.png',
        FlatSpellBlockMod: '/images/STATS/RM.png',
        FlatArmorMod: '/images/STATS/ARMOR.png',
        PercentMovementSpeedMod: '/images/STATS/MS.png',
        FlatCritChanceMod: '/images/STATS/CRITCHC.png',
        HealthRegenMod: '/images/STATS/HPREGEN.png',
        ManaRegenMod: '/images/STATS/MANARGEN.png',
        LifeStealMod: '/images/STATS/LIFESTEAL.png',
        SpellVampMod: '/images/STATS/OMNIVAMP.png',
        PercentLifeStealMod: '/images/STATS/LIFESTEAL.png',
        CooldownReductionMod: '/images/STATS/CDR.png',
        ArmorPenMod: '/images/STATS/ARMORPEN.png',
        MagicPenMod: '/images/STATS/MAGPEN.png',
        RangeMod: '/images/STATS/RANGE.png',
        TenacityMod: '/images/STATS/TENACITY.png'
    };
      
    const statNames = {
        FlatPhysicalDamageMod: 'Dégâts d\'attaque',
        FlatMagicDamageMod: 'Puissance',
        PercentAttackSpeedMod: 'Vitesse d\'attaque',
        FlatHPPoolMod: 'Santé',
        FlatMPPoolMod: 'Mana',
        FlatSpellBlockMod: 'Résistance magique',
        FlatArmorMod: 'Armure',
        PercentMovementSpeedMod: 'Vitesse de déplacement',
        FlatCritChanceMod: 'Chance de coup critique',
        HealthRegenMod: 'Régénération de vie',
        ManaRegenMod: 'Régénération de mana',
        LifeStealMod: 'Vol de vie',
        PercentLifeStealMod: 'Vol de vie',
        SpellVampMod: 'Omnivampirisme',
        CooldownReductionMod: 'Réduction de temps de recharge',
        ArmorPenMod: 'Pénétration d\'armure',
        MagicPenMod: 'Pénétration magique',
        RangeMod: 'Portée',
        TenacityMod: 'Ténacité'
    };

    async function fetchItems() {
        try {
            const response = await fetch('https://ddragon.leagueoflegends.com/cdn/14.23.1/data/fr_FR/item.json');
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

        let filteredItems;
        if (category === 'AttackDamage') {
            filteredItems = allItems.filter(item => item.stats && item.stats.FlatPhysicalDamageMod);
        } else if (category === 'AbilityPower') {
            filteredItems = allItems.filter(item => item.stats && item.stats.FlatMagicDamageMod);
        } else {
            filteredItems = allItems.filter(item => item.tags && item.tags.includes(category));
        }
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
            <img src="https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/${item.image.full}" alt="${item.name}" title="${item.name}" loading="lazy">
        `;

        card.addEventListener('mouseenter', (e) => {
            isHovering = true;
            showItemDetails(item, e.currentTarget, e);
        });
        card.addEventListener('mouseleave', () => {
            isHovering = false;
            setTimeout(() => {
                if (!isHovering) {
                    hideModal();
                }
            }, 850);
        });

        return card;
    }

    function showItemDetails(item, element, e) {
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
                            <img src="https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/${allItems.find(i => i.id === componentId)?.image.full}" 
                                 alt="${allItems.find(i => i.id === componentId)?.name}"
                                 title="${allItems.find(i => i.id === componentId)?.name}">
                        `).join('')}
                    </div>
                    <div class="remaining-cost">Coût restant: ${calculateRemainingCost(item)} or</div>
                </div>
            `;
        }

        let transformsHtml = '';
        if (into && into.length > 0)
             {
            transformsHtml = `
                <div class="transforms">
                    <div class="transforms-title">Se transforme en:</div>
                    <div class="transform-items">
                        ${into.map(transformId => `
                            <img src="https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/${allItems.find(i => i.id === transformId)?.image.full}"
                                 alt="${allItems.find(i => i.id === transformId)?.name}"
                                 title="${allItems.find(i => i.id === transformId)?.name}">
                        `).join('')}
                    </div>
                </div>
            `;
        }

        itemDetails.innerHTML = `
            <h2>${name}</h2>
            <img src="https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/${item.image.full}" 
                 alt="${name}" 
                 class="main-image">
            ${statsHtml}
            <p>${formattedDescription}</p>
            <div class="gold-info">Prix: ${gold.total} or</div>
            ${recipeHtml}
            ${transformsHtml}
        `;
    }

    function updateMousePosition(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (modal.classList.contains('visible')) {
            positionModal();
        }
    }

    document.addEventListener('mousemove', updateMousePosition);

    function showModal(element) {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.transform = 'translateY(0)';
        modal.classList.add('visible');
        positionModal();
    }

    function positionModal() {
        const modalContent = modal.querySelector('.modal-content');
        const modalWidth = modalContent.offsetWidth;
        const modalHeight = modalContent.offsetHeight;

        let left = mouseX + 10; // 10px à droite du curseur
        let top = mouseY + 10; // 10px en dessous du curseur

        // Ajuster la position si le modal dépasse de la fenêtre
        if (left + modalWidth > window.innerWidth) {
            left = mouseX - modalWidth - 10;
        }
        if (top + modalHeight > window.innerHeight) {
            top = window.innerHeight - modalHeight;
        }

        modalContent.style.left = `${left}px`;
        modalContent.style.top = `${top}px`;
    }

    function hideModal() {
        if (!isHovering) {
            const modalContent = modal.querySelector('.modal-content');
            modalContent.style.transform = 'translateY(100vh)';
            modal.classList.remove('visible');
            activeItem = null;
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

    // Add event listeners to handle modal visibility
    modal.querySelector('.modal-content').addEventListener('mouseenter', () => {
        isHovering = true;
    });

    modal.querySelector('.modal-content').addEventListener('mouseleave', () => {
        isHovering = false;
        setTimeout(() => {
            if (!isHovering) {
                hideModal();
            }
        }, 100);
    });

    fetchItems();
});