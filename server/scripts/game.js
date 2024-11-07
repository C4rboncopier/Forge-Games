const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const isAdmin = localStorage.getItem('username');
console.log(localStorage.getItem('username'));
if (isAdmin === 'Admin') {
    document.querySelector('.game-actions').style.display = 'none';
} else {
    document.querySelector('.game-actions').style.display = 'flex';
}


menuToggle.addEventListener('click', (event) => {
    event.preventDefault();
    navLinks.classList.toggle('active');
});

function redirectToGamePage(game) {
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
}

document.addEventListener('DOMContentLoaded', () => {
    const gameDetails = JSON.parse(sessionStorage.getItem('selectedGame'));
    console.log(sessionStorage.getItem('selectedGame'));
    if (gameDetails) {
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
        document.querySelector('.game-price').textContent = `₱${parseFloat(gameDetails.price).toFixed(2)}`;
        document.querySelector('.screenshot1-img').src = gameDetails.screenshot2;
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
});