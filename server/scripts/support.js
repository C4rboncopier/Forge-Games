function initializeSupportPage() {
    const searchInput = document.querySelector('.support-search input');
    const searchButton = document.querySelector('.support-search button');

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        console.log('Searching for:', searchTerm);
    }

    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        performSearch();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

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
                        searchBar.value = '';
                        searchResults.classList.remove('active');
                        redirectToGamePage(selectedGame);
                    }
                }
                break;
        }
    });
}

document.addEventListener('componentsLoaded', initializeSupportPage); 