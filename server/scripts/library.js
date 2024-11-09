document.addEventListener('DOMContentLoaded', async function() {
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = '/login';
        return;
    }

    const mainContent = document.querySelector('main');
    await loadLibrary(username);

    async function loadLibrary(username) {
        try {
            const response = await fetch(`/api/library/${username}`);
            const games = await response.json();

            if (!Array.isArray(games)) {
                throw new Error('Invalid response format');
            }

            if (games.length === 0) {
                displayEmptyLibrary();
                return;
            }

            displayGames(games);
        } catch (error) {
            console.error('Error loading library:', error);
            displayError();
        }
    }

    function displayGames(games) {
        const libraryHTML = `
            <div class="library-container">
                <h1>My Library</h1>
                <div class="games-grid">
                    ${games.map(game => `
                        <div class="game-card">
                            <img src="${game.gameUrl || '/assets/placeholder-game.png'}" alt="${game.title}">
                            <div class="game-info">
                                <h3>${game.title}</h3>
                                <p class="game-developer">${game.developer}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        mainContent.innerHTML = libraryHTML;

        // Add click event listeners to game cards
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                const game = games[index];
                redirectToGamePage(game);
            });
        });
    }

    function redirectToGamePage(game) {
        sessionStorage.setItem('selectedGame', JSON.stringify({
            title: game.title,
            genre: game.genre,
            developer: game.developer,
            gameUrl: game.gameUrl || '/assets/placeholder-game.png',
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

    function displayEmptyLibrary() {
        const emptyHTML = `
            <div class="empty-library">
                <h1>My Library</h1>
                <div class="empty-message">
                    <p>Your library is empty</p>
                    <button onclick="window.location.href='/browse'" class="browse-button">Browse Games</button>
                </div>
            </div>
        `;

        mainContent.innerHTML = emptyHTML;
    }

    function displayError() {
        const errorHTML = `
            <div class="error-message">
                <h1>Oops!</h1>
                <p>Something went wrong while loading your library.</p>
                <button onclick="window.location.reload()" class="retry-button">Try Again</button>
            </div>
        `;

        mainContent.innerHTML = errorHTML;
    }

    const searchContainer = document.querySelector('.search-container');
    const searchBar = document.querySelector('.search-bar');
    let searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchContainer.appendChild(searchResults);
    
    let games = [];
    let searchTimeout;

    fetch('/api/home')
        .then(response => response.json())
        .then(data => {
            games = data;
        })
        .catch(error => console.error('Error fetching games:', error));

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

    searchBar.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
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