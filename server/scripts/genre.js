document.addEventListener('DOMContentLoaded', function() {
    const genreTitle = document.getElementById('genre-title');
    const gamesGrid = document.getElementById('games-grid');
    const searchBar = document.querySelector('.search-bar');
    const searchResults = document.querySelector('.search-results');
    
    // Get genre from URL
    const currentPath = window.location.pathname;
    const genre = decodeURIComponent(currentPath.split('/genre/')[1]);
    
    // Update page title
    genreTitle.textContent = `${genre} Games`;
    document.title = `${genre} Games - Forge Games`;
    document.querySelector('.genre-img').src = `/assets/genre/${genre}.png`;
    
    // Get the genre from the URL
    const pathSegments = window.location.pathname.split('/');
    
    // Update the description
    const descriptionElement = document.getElementById('genre-description');
    if (descriptionElement) {
        descriptionElement.textContent = getGenreDescription(genre);
    }
    
    // Fetch games by genre
    async function fetchGames() {
        try {
            const response = await fetch(`/api/genre/${encodeURIComponent(genre)}`);
            if (!response.ok) throw new Error('Failed to fetch games');
            
            const games = await response.json();
            displayGames(games);
        } catch (error) {
            console.error('Error:', error);
            gamesGrid.innerHTML = '<div class="no-games">Failed to load games. Please try again later.</div>';
        }
    }
    
    // Display games in grid
    function displayGames(games) {
        if (games.length === 0) {
            gamesGrid.innerHTML = `<div class="no-games">No ${genre} games found.</div>`;
            return;
        }

        const limitedGames = games.slice(0, 6);
        
        gamesGrid.innerHTML = limitedGames.map(game => `
            <div class="game-card" onclick="redirectToGamePage(${JSON.stringify(game).replace(/"/g, '&quot;')})">
                <img src="${game.gameUrl || '/assets/main/default_image.jpg'}" alt="${game.title}">
                <div class="game-info">
                    <h3>${game.title}</h3>
                    <div class="game-price">₱${parseFloat(game.price).toFixed(2)}</div>
                </div>
            </div>
        `).join('');
    }
    
    // Redirect to game page
    window.redirectToGamePage = function(game) {
        sessionStorage.setItem('selectedGame', JSON.stringify({
            title: game.title,
            genre: game.genre,
            developer: game.developer,
            gameUrl: game.gameUrl,
            description: game.description || 'No description available.',
            price: game.price,
            banner: game.bannerUrl,
            screenshot1: game.screenshot1Url,
            screenshot2: game.screenshot2Url,
            screenshot3: game.screenshot3Url
        }));
        const urlSafeTitle = encodeURIComponent(game.title.toLowerCase().replace(/\s+/g, '-'));
        window.location.href = `/games/${urlSafeTitle}`;
    };
    
    // Initialize page
    fetchGames();
    
    // Search functionality
    let searchTimeout;
    let games = [];
    
    async function fetchAllGames() {
        try {
            const response = await fetch('/api/home');
            if (!response.ok) throw new Error('Failed to fetch games');
            games = await response.json();
        } catch (error) {
            console.error('Error fetching games:', error);
        }
    }
    
    function performSearch(query) {
        if (!query.trim()) {
            searchResults.classList.remove('active');
            return;
        }
        
        const filteredGames = games.filter(game => 
            game.title.toLowerCase().includes(query.toLowerCase())
        );
        
        displaySearchResults(filteredGames);
    }
    
    function displaySearchResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No games found</div>';
        } else {
            searchResults.innerHTML = results.map(game => `
                <div class="search-result-item" data-title="${game.title}">
                    <img src="${game.gameUrl || '/assets/main/default_image.jpg'}" alt="${game.title}">
                    <div class="result-info">
                        <div class="result-title">${game.title}</div>
                        <div class="result-price">₱${parseFloat(game.price).toFixed(2)}</div>
                    </div>
                </div>
            `).join('');
        }
        searchResults.classList.add('active');
    }
    
    // Event listeners
    searchBar.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 300);
    });
    
    document.addEventListener('click', (e) => {
        if (!searchBar.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
    
    searchResults.addEventListener('click', (e) => {
        const resultItem = e.target.closest('.search-result-item');
        if (resultItem) {
            const gameTitle = resultItem.dataset.title;
            const selectedGame = games.find(game => game.title === gameTitle);
            if (selectedGame) {
                searchBar.value = '';
                searchResults.classList.remove('active');
                redirectToGamePage(selectedGame);
            }
        }
    });
    
    // Initialize search
    fetchAllGames();
});

function getGenreDescription(genre) {
    switch(genre.toLowerCase()) {
        case 'action':
            return "Dive into an adrenaline-fueled experience with explosive action scenes, relentless combat sequences, and powerful heroes facing off against formidable foes. These games are designed to keep you on the edge of your seat with high-stakes battles, daring escapes, and nonstop thrills that demand quick reflexes and sharp skills.";
        case 'adventure':
            return "Set out on unforgettable quests through richly imagined worlds, from mysterious ancient lands to futuristic realms. Adventure games offer immersive storytelling, intricate puzzles, and opportunities to uncover secrets, pushing you to explore and interact with the environment as you unravel tales of courage, discovery, and wonder.";
        case 'rpg':
            return "Enter deeply crafted worlds where every choice shapes your journey and character. RPGs offer complex narratives, a cast of unforgettable characters, and opportunities for customization, allowing you to develop unique abilities, form alliances, and engage in battles as you strive to fulfill your destiny in worlds brimming with lore and mystery.";
        case 'strategy':
            return "Sharpen your mind and prepare to lead as you devise intricate plans, manage resources, and outmaneuver opponents. Strategy games test your ability to think ahead, adapt to changing scenarios, and make tough decisions in scenarios that range from historical battles to futuristic conflicts and resource management challenges.";
        case 'simulation':
            return "Immerse yourself in highly realistic worlds where you can manage, build, and experience life from different perspectives. From city-building and farming to life simulations and even professional simulators, these games allow you to step into detailed environments and explore the intricacies of real-world systems and careers.";
        case 'sports':
            return "Experience the intensity and thrill of competitive sports, where skill, strategy, and timing come together. Sports games offer realistic gameplay mechanics, authentic player interactions, and a chance to compete in your favorite sports leagues, bringing stadiums and arenas to life with every shot, pass, and goal.";
        case 'racing':
            return "Push your limits with high-speed racing games that deliver the thrill of the track. Whether you’re navigating tight turns in exotic cars, dirt bikes, or motorcycles, racing games bring heart-pounding excitement and allow you to test your skills across diverse terrains, iconic courses, and intense circuits.";
        case 'indie':
            return "Explore a world of creativity with indie games that break traditional boundaries, offering unique gameplay mechanics, art styles, and storytelling. These games, often created by small teams or solo developers, bring fresh perspectives and innovation, letting you experience gaming from an independent lens.";
        case 'casual':
            return "Unwind with casual games designed for easy enjoyment and relaxation, perfect for players of all ages and skill levels. These games are accessible and engaging, offering fun and lighthearted gameplay that can be enjoyed in short sessions, making them a great choice for anyone looking to de-stress.";
        case 'horror':
            return "Step into the shadows and confront the unknown with horror games that immerse you in chilling atmospheres, spine-tingling soundscapes, and eerie storylines. Designed to scare and unsettle, these games often blend suspense, psychological horror, and survival elements to create a haunting experience that lingers long after you've finished playing.";
        default:
            return "Discover an incredible selection of games in this category, each offering its own unique gameplay, challenges, and unforgettable experiences.";
    }
    
}