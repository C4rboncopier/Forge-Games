// Global functions that need to be accessible from HTML
let redirectToFeaturedGame;
let filterByGenre;
let redirectToGamePage;

// Move your initialization code into this function
function initializeMainPage() {
    const gamesList = document.getElementById('games-grid');

    // Assign the function to the global variable
    redirectToFeaturedGame = async (gameTitle) => {
        try {
            const response = await fetch('/api/home');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const games = await response.json();
            const game = games.find(g => g.title.toLowerCase() === gameTitle.toLowerCase());
            
            if (game) {
                redirectToGamePage(game);
            } else {
                console.error('Featured game not found:', gameTitle);
            }
        } catch (error) {
            console.error('Error fetching featured game:', error);
        }
    };

    // Assign the function to the global variable
    filterByGenre = (genre) => {
        window.location.href = `/genre/${genre}`;
    };

    // Assign the function to the global variable
    redirectToGamePage = (game) => {
        sessionStorage.setItem('selectedGame', JSON.stringify({
            title: game.title,
            genre: game.genre,
            developer: game.developer,
            gameUrl: game.gameUrl || '/assets/main/default_image.jpg',
            description: game.description || 'No description available.',
            price: game.price,
            banner: game.bannerUrl || '/assets/placeholder-game.png',
            screenshot1: game.screenshot1Url,
            screenshot2: game.screenshot2Url,
            screenshot3: game.screenshot3Url
        }));
        const urlSafeTitle = encodeURIComponent(game.title.toLowerCase().replace(/\s+/g, '-'));
        window.location.href = `/games/${urlSafeTitle}`;
    };

    async function displayGames() {
        if (!gamesList) {
            console.error('games-grid element not found in HTML.');
            return;
        }

        try {
            const response = await fetch('/api/home');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const gamesData = await response.json();
            displayGamesForMain(gamesData);

        } catch (error) {
            console.error('Error fetching games:', error);
            gamesList.innerHTML = '<p class="error-message">Failed to load games</p>';
        }
    }

    function displayGamesForMain(gamesData) {
        gamesList.innerHTML = '';

        gamesData.slice(0, 12).forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';

            const imageUrl = game.gameUrl || '/assets/main/default_image.jpg';

            gameCard.innerHTML = `
                <img src="${imageUrl}" alt="${game.title}">
                <div class="game-info">
                    <h3>${game.title}</h3>
                    <div class="game-price">₱${parseFloat(game.price).toFixed(2)}</div>
                </div>
            `;

            gameCard.addEventListener('click', () => {
                redirectToGamePage(game);
            });

            gamesList.appendChild(gameCard);
        });
    }

    const searchContainer = document.querySelector('.search-container');
    const searchBar = document.querySelector('.search-bar');
    let searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchContainer.appendChild(searchResults);
    
    let games = []; // Will store all games data
    let searchTimeout;

    // Fetch games data when page loads
    fetch('/api/home')
        .then(response => response.json())
        .then(data => {
            games = data;
        })
        .catch(error => console.error('Error fetching games:', error));

    // Search function
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

    // Display search results
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

    // Event listener for search input
    searchBar.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 300); // Debounce search for better performance
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });

    // Handle click on search result
    searchResults.addEventListener('click', (e) => {
        const resultItem = e.target.closest('.search-result-item');
        if (resultItem) {
            const gameTitle = resultItem.dataset.title;
            const selectedGame = games.find(game => game.title === gameTitle);
            if (selectedGame) {
                searchBar.value = ''; // Clear the search input
                searchResults.classList.remove('active'); // Hide the search results
                redirectToGamePage(selectedGame);
            }
        }
    });

    // Handle keyboard navigation
    searchBar.addEventListener('keydown', (e) => {
        const items = searchResults.querySelectorAll('.search-result-item');
        const activeItem = searchResults.querySelector('.search-result-item:hover');
        let index = Array.from(items).indexOf(activeItem);

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (index < items.length - 1) index++;
                else index = 0;
                items[index]?.scrollIntoView({ block: 'nearest' });
                items[index]?.classList.add('hover');
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (index > 0) index--;
                else index = items.length - 1;
                items[index]?.scrollIntoView({ block: 'nearest' });
                items[index]?.classList.add('hover');
                break;
            case 'Enter':
                if (activeItem) {
                    const gameTitle = activeItem.dataset.title;
                    const selectedGame = games.find(game => game.title === gameTitle);
                    if (selectedGame) {
                        searchBar.value = ''; // Clear the search input
                        searchResults.classList.remove('active'); // Hide the search results
                        redirectToGamePage(selectedGame);
                    }
                }
                break;
        }
    });
    displayGames();
}

// Wait for components to be loaded before initializing
document.addEventListener('componentsLoaded', initializeMainPage);
