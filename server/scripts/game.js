const isAdmin = localStorage.getItem('username');
console.log(localStorage.getItem('username'));
if (isAdmin === 'Admin') {
    document.querySelector('.game-actions').style.display = 'none';
} else {
    document.querySelector('.game-actions').style.display = 'flex';
}

function logGameDetails(details, source) {
    console.log(`Game Details from ${source}:`, {
        id: details.id,
        title: details.title,
        price: details.price
    });
}

function redirectToGamePage(game) {
    logGameDetails(game, 'redirectToGamePage input');
    
    if (!game.id) {
        console.error('Game ID is missing:', game);
    }

    sessionStorage.setItem('selectedGame', JSON.stringify({
        id: game.id,
        title: game.title,
        genre: game.genre,
        developer: game.developer,
        gameUrl: game.gameUrl || '/assets/main/default_image.jpg',
        description: game.description || 'No description available.',
        price: game.price,
        banner: game.bannerUrl,
        screenshot1: game.screenshot1Url,
        screenshot2: game.screenshot2Url,
        screenshot3: game.screenshot3Url
    }));
    
    const stored = JSON.parse(sessionStorage.getItem('selectedGame'));
    logGameDetails(stored, 'stored in sessionStorage');
    
    const urlSafeTitle = encodeURIComponent(game.title.toLowerCase().replace(/\s+/g, '-'));
    window.location.href = `/games/${urlSafeTitle}`;
}

let userOwnsGame = false;

async function checkGameOwnership(username, gameTitle) {
    try {
        const response = await fetch(`/api/library/${username}`);
        const libraryGames = await response.json();
        return libraryGames.some(game => game.title === gameTitle);
    } catch (error) {
        console.error('Error checking game ownership:', error);
        return false;
    }
}

async function fetchGameDetails(title) {
    try {
        const response = await fetch(`/api/games/details/${encodeURIComponent(title)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch game details');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching game details:', error);
        return null;
    }
}

// Move the DOMContentLoaded event listener code into a function
async function initializeGame() {
    const gameDetails = JSON.parse(sessionStorage.getItem('selectedGame'));
    logGameDetails(gameDetails, 'DOMContentLoaded');
    
    const username = localStorage.getItem('username');
    
    if (gameDetails) {
        try {
            // Fetch complete game details from database
            const dbGameDetails = await fetchGameDetails(gameDetails.title);
            if (dbGameDetails) {
                // Update sessionStorage with database ID
                const updatedGameDetails = {
                    ...gameDetails,
                    id: dbGameDetails.id // Add the database ID
                };
                sessionStorage.setItem('selectedGame', JSON.stringify(updatedGameDetails));
                console.log('Updated game details with ID:', updatedGameDetails);
            }
        } catch (error) {
            console.error('Error updating game details:', error);
        }

        if (username) {
            userOwnsGame = await checkGameOwnership(username, gameDetails.title);
            updateButtons(userOwnsGame);
        }

        // Update the URL if it doesn't match the current game
        const currentPath = window.location.pathname;
        const expectedPath = `/games/${gameDetails.title.toLowerCase().replace(/\s+/g, '-')}`;
        
        if (currentPath !== expectedPath) {
            history.replaceState(null, '', expectedPath);
        }

        document.querySelector('.game-banner').src = gameDetails.banner;
        document.querySelector('.game-title').textContent = gameDetails.title;
        document.querySelector('.game-developer').textContent = gameDetails.developer;
        document.querySelector('.game-genre').textContent = gameDetails.genre;
        document.querySelector('.game-logo').src = gameDetails.gameUrl;
        document.querySelector('.game-description').textContent = gameDetails.description;
        
        // Ensure price is a number and properly formatted
        const price = typeof gameDetails.price === 'string' 
            ? parseFloat(gameDetails.price.replace(/[^\d.-]/g, '')) 
            : gameDetails.price;
        document.querySelector('.game-price').textContent = `₱${price.toFixed(2)}`;

        // Update screenshots
        document.querySelector('.screenshot1-img').src = gameDetails.screenshot1;
        document.querySelector('.screenshot2-img').src = gameDetails.screenshot2;
        document.querySelector('.screenshot3-img').src = gameDetails.screenshot3;

        document.querySelector('.desktopScreenshot1-img').src = gameDetails.screenshot1;
        document.querySelector('.desktopScreenshot2-img').src = gameDetails.screenshot2;
        document.querySelector('.desktopScreenshot3-img').src = gameDetails.screenshot3;

    } else {
        document.querySelector('.game-details').innerHTML = '<p class="error-message">Game details not available.</p>';
    }

    const searchContainer = document.querySelector('.search-container');
    const searchBar = document.querySelector('.search-bar');
    let searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchContainer.appendChild(searchResults);
    
    let games = [];
    let searchTimeout;

    fetch('/api/browse/games')
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
}

// Wait for both DOMContentLoaded and componentsLoaded events
document.addEventListener('DOMContentLoaded', () => {
    // Wait for components to load before initializing the game
    document.addEventListener('componentsLoaded', initializeGame);
});

function updateButtons(owned) {
    const buyButton = document.getElementById('buy-button');
    const wishlistButton = document.getElementById('wishlist-button');
    const gameActions = document.querySelector('.game-actions');
    
    if (owned) {
        // Hide the entire game-actions div if user owns the game
        gameActions.style.display = 'none';
    } else {
        // Show buttons if user doesn't own the game
        gameActions.style.display = 'flex';
        buyButton.textContent = 'Add to Cart';
        buyButton.classList.remove('uninstall-button');
        buyButton.classList.add('buy-button');
        wishlistButton.style.display = 'block';
    }
}