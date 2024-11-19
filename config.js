const config = {
    ddragonVersion: '14.22.1', // Version de DataDragon
    ddragonLang: 'fr_FR',      // Langue pour les données
    ddragonBaseUrl: 'https://ddragon.leagueoflegends.com/cdn' // URL de base
};

function getDdragonUrl(path) {
    return `${config.ddragonBaseUrl}/${config.ddragonVersion}/${path}`;
}
