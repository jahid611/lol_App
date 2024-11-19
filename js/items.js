document.addEventListener('DOMContentLoaded', () => {
    const itemsList = document.getElementById('itemsList');
    const searchBar = document.getElementById('searchBar');
    const categoryFilter = document.getElementById('categoryFilter');
    const modal = document.getElementById('itemModal');
    const itemDetails = document.getElementById('itemDetails');
    const closeButton = modal.querySelector('.close-button');
    let allItems = [];

    async function fetchItems() {
        try {
            const response = await fetch(getDdragonUrl(`data/${config.ddragonLang}/item.json`));
            if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
            const data = await response.json();

            allItems = Object.entries(data.data)
                .filter(([id, item]) => item.gold?.total > 0)
                .map(([id, item]) => ({ id, ...item }));

            populateCategoryFilter();
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
        Array.from(uniqueTags).forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            fragment.appendChild(option);
        });
        categoryFilter.appendChild(fragment);
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
        card.className = 'item-card';
        card.dataset.id = item.id;
        card.tabIndex = 0;
        card.innerHTML = `
            <img src="${getDdragonUrl(`img/item/${item.image.full}`)}" alt="${item.name}" loading="lazy">
            <p>${item.name}</p>
        `;
        card.addEventListener('click', () => showItemDetails(item));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showItemDetails(item);
            }
        });
        return card;
    }

    function showItemDetails(item) {
        updateModalContent(item);
        showModal();
    }

    function updateModalContent(item) {
        const { name, description, image, stats, gold } = item;
        itemDetails.innerHTML = `
            <h2 id="modalTitle">${name}</h2>
            <img id="modalImage" src="${getDdragonUrl(`img/item/${image.full}`)}" alt="${name}">
            <p id="modalDescription">${description}</p>
            <div id="modalStats">
                ${stats ? Object.entries(stats).map(([stat, value]) => `
                    <div>
                        <img class="stat-icon" src="${getStatIcon(stat)}" alt="${stat}">
                        ${formatStat(stat, value)}
                    </div>
                `).join('') : ''}
                ${gold ? `
                    <div>
                        <img class="stat-icon" src="${getStatIcon('gold')}" alt="Gold">
                        Prix: ${gold.total} gold
                    </div>
                ` : ''}
            </div>
        `;
    }

    function getStatIcon(stat) {
        const iconMap = {
            FlatPhysicalDamageMod: 'statmodsattackspeedicon.png',
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

    function showModal() {
        modal.classList.add('visible');
        modal.setAttribute('aria-hidden', 'false');
        closeButton.focus();
    }

    function hideModal() {
        modal.classList.remove('visible');
        modal.setAttribute('aria-hidden', 'true');
    }

    closeButton.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
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

    fetchItems();
});