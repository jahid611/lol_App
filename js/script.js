document.addEventListener('DOMContentLoaded', () => {
    const championTypes = document.querySelectorAll('.champion-type');
    const championImage = document.getElementById('championImage');

    const championImages = {
        assassins: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/befd42ad6d2564159a441d08cfc3bf511532eb74-1628x1628.png?auto=format&fit=fill&q=80&w=736',
        mages: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news/ff6c8c57411e5c7e0551b02334fccedc78866143-1628x1628.png?auto=format&fit=fill&q=80&w=736',
        tireurs: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news/f136500bd46f823d37515a72b867425d3a0b3e54-1628x1628.png?auto=format&fit=fill&q=80&w=736',
        tanks: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/95daf6dd2b28f03d5ba2ea1fabbabc3bc3ff6e6e-1628x1628.png?auto=format&fit=fill&q=80&w=736',
        combattants: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/70c26e49de8a2c79ac3de144772d2debd195edff-1628x1628.png?auto=format&fit=fill&q=80&w=736',
        supports: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news/dbdded937cd214bb2a1189697a9e4f49f8c04505-1628x1628.png?auto=format&fit=fill&q=80&w=736',
    };

    championTypes.forEach(type => {
        type.addEventListener('click', () => {
            const championType = type.dataset.type;
            if (championImages[championType]) {
                championImage.src = championImages[championType];
                
                // Retire la classe active de tous les types
                championTypes.forEach(t => t.classList.remove('active'));
                
                // Ajoute la classe active au type cliqué
                type.classList.add('active');
            }
        });
    });

    // Définir le premier type comme actif par défaut
    championTypes[0].classList.add('active');
});