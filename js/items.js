document.addEventListener('DOMContentLoaded', () => {
    const itemsList = document.getElementById('itemsList');
    const categoriesList = document.getElementById('categoriesList');
    const searchBar = document.getElementById('searchBar');
    const categoryFilter = document.getElementById('categoryFilter');
    const modal = document.getElementById('itemModal');
    const itemDetails = document.getElementById('itemDetails');
    const closeButton = modal.querySelector('.close-button');
    let allItems = [];
    let activeItem = null;
    let isModalVisible = false;
    let hoverTimer;
    const HOVER_DELAY = 1000; // 1 seconde

    const categories = {
        'AttackDamage': 'Attack Damage',
        'AttackSpeed': 'Attack Speed',
        'AdaptiveForce': 'Adaptive Force',
        'Armor': 'Armor',
        'Health': 'Health',
        'MagicResist': 'Magic Resist',
        'MovementSpeed': 'Movement Speed',
        'CriticalStrike': 'Critical Strike'
    };

    async function fetchItems() {
        try {
            const response = await fetch(getDdragonUrl(`data/${config.ddragonLang}/item.json`));
            if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
            const data = await response.json();

            allItems = Object.entries(data.data)
                .filter(([id, item]) => {
                    return item.gold && item.gold.total > 0 && 
                           item.maps && item.maps['11'] && 
                           !item.tags.includes('Jungle') && 
                           !item.tags.includes('Lane') && 
                           !item.description.includes('Teamfight Tactics') && 
                           !item.requiredChampion && 
                           item.depth >= 2;
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

        const filteredItems = allItems.filter(item => {
            return item.stats && Object.keys(item.stats).some(stat => {
                return (category === 'AttackDamage' && stat === 'FlatPhysicalDamageMod') ||
                       (category === 'AttackSpeed' && stat === 'PercentAttackSpeedMod') ||
                       (category === 'AdaptiveForce' && (stat === 'FlatMagicDamageMod' || stat === 'FlatPhysicalDamageMod')) ||
                       (category === 'Armor' && stat === 'FlatArmorMod') ||
                       (category === 'Health' && stat === 'FlatHPPoolMod') ||
                       (category === 'MagicResist' && stat === 'FlatSpellBlockMod') ||
                       (category === 'MovementSpeed' && stat === 'PercentMovementSpeedMod') ||
                       (category === 'CriticalStrike' && stat === 'FlatCritChanceMod');
            });
        });
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
            <img class="item-hover-zone" src="${getDdragonUrl(`img/item/${item.image.full}`)}" alt="${item.name}" title="${item.name}" loading="lazy">
        `;

        const hoverZone = card.querySelector('.item-hover-zone');

        // Only add event listeners to the image itself
        hoverZone.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => {
                if (!isModalVisible || activeItem !== item) {
                    showItemDetails(item, hoverZone); // Pass hoverZone instead of card
                }
            }, HOVER_DELAY);
        });

        hoverZone.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimer);
            hideModal();
        });

        return card;
    }

    function showItemDetails(item, element) {
        if (activeItem === item && isModalVisible) return;
        activeItem = item;
        updateModalContent(item);
        showModal(element);
        isModalVisible = true;
    }

    function updateModalContent(item) {
        const { name, description, image, stats, gold } = item;
        
        const formattedDescription = description
            .replace(/physical damage/gi, '<span class="keyword-physical">physical damage</span>')
            .replace(/magic damage/gi, '<span class="keyword-magic">magic damage</span>')
            .replace(/UNIQUE/gi, '<span class="keyword-unique">UNIQUE</span>');
    
        itemDetails.innerHTML = `
            <h2 id="modalTitle">${name}</h2>
            <img id="modalImage" src="${getDdragonUrl(`img/item/${image.full}`)}" alt="${name}">
            
            ${stats ? Object.entries(stats).map(([stat, value]) => `
                <div class="stat-line">
                    ${formatStat(stat, value)}
                </div>
            `).join('') : ''}
    
            ${description ? `
                <div class="passive-section">
                    <div class="passive-description">${formattedDescription}</div>
                </div>
            ` : ''}
    
            ${stats ? `
                <div id="modalStats">
                    ${Object.entries(stats).map(([stat, value]) => `
                        <div class="stat-category">
                            <img class="stat-icon" src="${getStatIcon(stat)}" alt="${stat}">
                            <span class="stat-value">${formatStat(stat, value)}</span>
                        </div>
                    `).join('')}
                </div>
                ${createStatChart(stats)}
            ` : ''}
    
            ${item.from ? `
                <div class="recipe-section">
                    <div class="recipe-title">Recipe:</div>
                    <div class="recipe-items">
                        ${item.from.map(itemId => `
                            <img class="recipe-item" 
                                 src="${getDdragonUrl(`img/item/${itemId}.png`)}" 
                                 alt="Recipe item ${itemId}"
                                 loading="lazy">
                        `).join('')}
                        <div class="recipe-cost">+300 (Crafting Cost)</div>
                    </div>
                </div>
            ` : ''}
            ${item.into ? `
                <div class="recipe-section">
                    <div class="recipe-title">Se transforme en:</div>
                    <div class="recipe-items">
                        ${item.into.map(itemId => `
                            <img class="recipe-item" 
                                 src="${getDdragonUrl(`img/item/${itemId}.png`)}" 
                                 alt="Builds into item ${itemId}"
                                 loading="lazy">
                        `).join('')}
                    </div>
                </div>
            ` : ''}
    
            ${gold ? `
                <div class="gold-cost">
                    <img class="gold-icon" src="${getStatIcon('gold')}" alt="Gold">
                    <span>Prix: ${gold.total} gold</span>
                </div>
            ` : ''}
        `;
    }

    function getStatIcon(stat) {
        const iconMap = {
            FlatPhysicalDamageMod: 'statmodsadaptiveforceicon.png',
            FlatMagicDamageMod: 'statmodsadaptiveforceicon.png',
            PercentAttackSpeedMod: 'statmodsattackspeedicon.png',
            FlatHPPoolMod: 'statmodshealthscalingicon.png',
            FlatSpellBlockMod: 'statmodsmagicresicon.png',
            FlatArmorMod: 'statmodsarmoricon.png',
            PercentMovementSpeedMod: 'statmodsmovementspeedicon.png',
            FlatCritChanceMod: 'statmodscdrscalingicon.png',
            gold: 'statmodsgoldicon.png'
        };
        const iconName = iconMap[stat] || 'statmodsadaptiveforceicon.png';
        return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/${iconName}`;
    }

    function formatStat(stat, value) {
        const statNames = {
            FlatPhysicalDamageMod: 'AD',
            FlatMagicDamageMod: 'AP',
            PercentAttackSpeedMod: 'Vitesse d\'attaque',
            FlatHPPoolMod: 'Santé',
            FlatSpellBlockMod: 'Résistance magique',
            FlatArmorMod: 'Armure',
            PercentMovementSpeedMod: 'Vitesse de déplacement',
            FlatCritChanceMod: 'Chance de coup critique'
        };

        const formattedValue = stat.startsWith('Percent') ? `${(value * 100).toFixed(0)}%` : value;
        return `${statNames[stat] || stat}: ${formattedValue}`;
    }

    function showModal(element) {
        const rect = element.getBoundingClientRect();
        const modalContent = modal.querySelector('.modal-content');
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const itemsContainer = document.querySelector('.items-container');
        const containerRect = itemsContainer.getBoundingClientRect();

        let left = containerRect.right + 20;
        let top = Math.max(60, rect.top + window.scrollY);

        if (left + modalContent.offsetWidth > viewportWidth - 20) {
            left = Math.max(20, containerRect.left - modalContent.offsetWidth - 20);
        }

        if (top + modalContent.offsetHeight > viewportHeight + window.scrollY) {
            top = viewportHeight + window.scrollY - modalContent.offsetHeight - 20;
        }

        top = Math.max(60, top);

        modalContent.style.left = `${left}px`;
        modalContent.style.top = `${top}px`;
        
        modal.classList.add('visible');
        modal.setAttribute('aria-hidden', 'false');
    }

    function hideModal() {
        modal.classList.remove('visible');
        modal.setAttribute('aria-hidden', 'true');
        isModalVisible = false;
        activeItem = null;
    }

    closeButton.addEventListener('click', hideModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    // Simplify click handler to only check for hover-zone
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.item-hover-zone')) {
            hideModal();
        }
    });

    document.addEventListener('wheel', () => {
        if (isModalVisible) {
            hideModal();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('visible')) {
            hideModal();
        }
    });

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

    function createStatChart(stats) {
        const chartSize = 150;
        const centerX = chartSize / 2;
        const centerY = chartSize / 2;
        const maxStat = Math.max(...Object.values(stats));
        const angleStep = (Math.PI * 2) / Object.keys(stats).length;

        let polygonPoints = '';
        let labels = '';

        Object.entries(stats).forEach(([stat, value], index) => {
            const angle = index * angleStep - Math.PI / 2;
            const radius = (value / maxStat) * (chartSize / 2 - 20);
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            polygonPoints += `${x},${y} `;

            const labelX = centerX + (chartSize / 2 - 10) * Math.cos(angle);
            const labelY = centerY + (chartSize / 2 - 10) * Math.sin(angle);
            labels += `<text x="${labelX}" y="${labelY}">${stat}</text>`;
        });

        return `
            <svg class="stat-chart" viewBox="0 0 ${chartSize} ${chartSize}">
              <polygon class="stat-chart-polygon" points="${polygonPoints}" />
              <g class="stat-chart-labels">${labels}</g>
            </svg>
        `;
    }

    fetchItems();
});