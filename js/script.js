document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const championFilter = document.getElementById('championFilter');
    const itemFilter = document.getElementById('itemFilter');
    let allData = { champions: [], items: [] };

    const config = {
        ddragonVersion: '14.22.1',
        ddragonLang: 'fr_FR',
        ddragonBaseUrl: 'https://ddragon.leagueoflegends.com/cdn'
    };

    function getDdragonUrl(path) {
        return `${config.ddragonBaseUrl}/${config.ddragonVersion}/${path}`;
    }

    async function fetchData() {
        try {
            const [championsResponse, itemsResponse] = await Promise.all([
                fetch(getDdragonUrl(`data/${config.ddragonLang}/champion.json`)),
                fetch(getDdragonUrl(`data/${config.ddragonLang}/item.json`))
            ]);

            if (!championsResponse.ok || !itemsResponse.ok) {
                throw new Error('Network response was not ok');
            }

            const championsData = await championsResponse.json();
            const itemsData = await itemsResponse.json();

            allData.champions = Object.values(championsData.data);
            
            allData.items = Object.values(itemsData.data).filter(item => {
                return item.maps && item.maps['11'] && !item.tags.includes('Jungle') && !item.tags.includes('Lane') && !item.requiredChampion;
            });

            console.log('Data loaded successfully');
            console.log(`Loaded ${allData.champions.length} champions and ${allData.items.length} items`);
        } catch (error) {
            console.error('Error fetching data:', error);
            searchResults.innerHTML = '<p>Une erreur est survenue lors du chargement des données. Veuillez réessayer plus tard.</p>';
        }
    }

    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const showChampions = championFilter.checked;
        const showItems = itemFilter.checked;
        
        if (searchTerm === '') {
            searchResults.innerHTML = '';
            return;
        }

        let results = [];

        if (showChampions) {
            const filteredChampions = allData.champions.filter(champion => 
                champion.name.toLowerCase().includes(searchTerm) ||
                champion.title.toLowerCase().includes(searchTerm)
            );
            results = results.concat(filteredChampions.map(c => ({ ...c, type: 'champion' })));
        }

        if (showItems) {
            const filteredItems = allData.items.filter(item => 
                item.name.toLowerCase().includes(searchTerm) ||
                (item.description && item.description.toLowerCase().includes(searchTerm))
            );
            results = results.concat(filteredItems.map(i => ({ ...i, type: 'item' })));
        }

        displayResults(results);
    }

    function displayResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = '<p>Aucun résultat trouvé.</p>';
            return;
        }

        searchResults.innerHTML = results.map(result => `
            <div class="result-item">
                <img src="${getImageUrl(result)}" 
                     alt="${result.name}"
                     onerror="this.onerror=null; this.src='placeholder.png';">
                <p>${result.name}</p>
                <span class="result-type">${result.type === 'champion' ? 'Champion' : 'Item'}</span>
            </div>
        `).join('');
    }

    function getImageUrl(result) {
        if (result.type === 'champion') {
            return getDdragonUrl(`img/champion/${result.image.full}`);
        } else {
            return getDdragonUrl(`img/item/${result.image.full}`);
        }
    }

    searchInput.addEventListener('input', performSearch);
    championFilter.addEventListener('change', performSearch);
    itemFilter.addEventListener('change', performSearch);

    fetchData().then(() => {
        searchInput.disabled = false;
        searchInput.placeholder = "Rechercher des champions ou des objets...";
    });
});