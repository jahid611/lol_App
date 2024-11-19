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

        Array.from(uniqueTags).forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            categoryFilter.appendChild(option);
        });
    }

    function displayItems(items) {
        itemsList.innerHTML = items.map(createItemCard).join('');
    }

    function createItemCard(item) {
        return `
            <div class="item-card" data-id="${item.id}">
                <img src="${getDdragonUrl(`img/item/${item.image.full}`)}" alt="${item.name}">
                <p>${item.name}</p>
            </div>
        `;
    }

    fetchItems();
});
