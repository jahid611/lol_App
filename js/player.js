document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const resultsGrid = document.getElementById('resultsGrid');
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    const closeButton = document.querySelector('.close-button');

    let champions = [];
    let items = [];

    // Simulating API calls to fetch champions and items data
    const fetchChampions = async () => {
        const response = await fetch('https://ddragon.leagueoflegends.com/cdn/13.1.1/data/fr_FR/champion.json');
        const data = await response.json();
        champions = Object.values(data.data);
    };

    const fetchItems = async () => {
        const response = await fetch('https://ddragon.leagueoflegends.com/cdn/13.1.1/data/fr_FR/item.json');
        const data = await response.json();
        items = Object.values(data.data);
    };

    const init = async () => {
        await Promise.all([fetchChampions(), fetchItems()]);
    };

    init();

    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredChampions = champions.filter(champion => 
            champion.name.toLowerCase().includes(searchTerm) || 
            champion.title.toLowerCase().includes(searchTerm)
        );
        const filteredItems = items.filter(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            item.description.toLowerCase().includes(searchTerm)
        );

        displayResults([...filteredChampions, ...filteredItems]);
    };

    const displayResults = (results) => {
        resultsGrid.innerHTML = '';
        results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.classList.add('result-item');
            resultElement.innerHTML = `
                <img src="https://ddragon.leagueoflegends.com/cdn/13.1.1/img/${result.image ? 'champion' : 'item'}/${result.image ? result.image.full : result.image}" alt="${result.name}">
                <h3>${result.name}</h3>
            `;
            resultElement.addEventListener('click', () => showDetails(result));
            resultsGrid.appendChild(resultElement);
        });
        searchResults.classList.remove('hidden');
    };

    const showDetails = (entity) => {
        let content = `
            <h2>${entity.name}</h2>
            <img src="https://ddragon.leagueoflegends.com/cdn/13.1.1/img/${entity.image ? 'champion' : 'item'}/${entity.image ? entity.image.full : entity.image}" alt="${entity.name}">
        `;

        if (entity.title) {
            // It's a champion
            content += `
                <p><strong>Titre:</strong> ${entity.title}</p>
                <p><strong>Rôle:</strong> ${entity.tags.join(', ')}</p>
                <p><strong>Description:</strong> ${entity.blurb}</p>
            `;
        } else {
            // It's an item
            content += `
                <p><strong>Description:</strong> ${entity.description}</p>
                <p><strong>Prix:</strong> ${entity.gold.total} or</p>
            `;
        }

        modalContent.innerHTML = content;
        modal.classList.remove('hidden');
    };

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    closeButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Change hero background image every 10 seconds
    const heroImages = [
        'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg',
        'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ambessa_0.jpg',
        'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yone_0.jpg',
        'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Gwen_0.jpg'
    ];

    const heroSection = document.querySelector('.hero');
    let currentImageIndex = 0;

    function changeHeroBackground() {
        currentImageIndex = (currentImageIndex + 1) % heroImages.length;
        heroSection.style.backgroundImage = `url('${heroImages[currentImageIndex]}')`;
    }

    setInterval(changeHeroBackground, 10000);
});