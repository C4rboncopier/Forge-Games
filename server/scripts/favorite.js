// Global variables
let redirectToGamePage;

function initializeFavoritePage() {
    const user = localStorage.getItem('username');
    if (!user) {
        window.location.href = '/login';
        return;
    }

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

    loadFavorites();
}

async function loadFavorites() {
    const user = localStorage.getItem('username');
    const favoritesGrid = document.getElementById('favoritesGrid');
    const emptyFavorites = document.getElementById('emptyFavorites');

    try {
        const response = await fetch(`/api/favorites/${user}`);
        const favorites = await response.json();

        if (favorites.length === 0) {
            favoritesGrid.style.display = 'none';
            emptyFavorites.style.display = 'flex';
        } else {
            favoritesGrid.style.display = 'grid';
            emptyFavorites.style.display = 'none';
            displayFavorites(favorites);
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        favoritesGrid.innerHTML = '<p class="error-message">Error loading favorites</p>';
    }
}

function displayFavorites(favorites) {
    const favoritesGrid = document.getElementById('favoritesGrid');
    favoritesGrid.innerHTML = '';

    favorites.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        
        // Store the game ID safely by escaping special characters
        const safeGameId = game.id.replace(/'/g, "\\'");
        
        gameCard.innerHTML = `
            <div class="game-image">
                <img src="${game.gameUrl || '/assets/placeholder-game.png'}" alt="${game.title}">
            </div>
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <p class="game-developer">${game.developer}</p>
                <p class="game-price">₱${parseFloat(game.price).toFixed(2)}</p>
                <div class="game-actions">
                    <button class="add-to-cart-btn" data-game-id="${safeGameId}">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="remove-button" data-game-id="${safeGameId}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;

        // Add event listeners using delegation
        const addToCartBtn = gameCard.querySelector('.add-to-cart-btn');
        const removeBtn = gameCard.querySelector('.remove-button');

        addToCartBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            addToCart(game.id);
        });

        removeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            removeFromFavorites(game.id);
        });

        favoritesGrid.appendChild(gameCard);
    });
}

async function addToCart(gameId) {
    const user = localStorage.getItem('username');
    if (!user) {
        window.location.href = '/login';
        return;
    }

    try {
        // Add to cart
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: user,
                gameId: gameId
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // If successfully added to cart, remove from favorites
            const removeResponse = await fetch('/api/favorites/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: user,
                    gameId: gameId
                })
            });

            if (removeResponse.ok) {
                showCartPopup();
                loadFavorites(); // Reload the favorites list
            } else {
                throw new Error('Failed to remove from favorites after adding to cart');
            }
        } else {
            if (data.error === 'GAME_IN_LIBRARY') {
                throw new Error('This game is already in your library');
            } else if (data.error === 'Game already exists in cart') {
                throw new Error('This game is already in your cart');
            } else {
                throw new Error(data.error || 'Failed to add game to cart');
            }
        }
    } catch (error) {
        console.error('Detailed error:', error);
        
        // Show error message to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = error.message || 'Unable to add game to cart. Please try again later.';
        errorMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--error-color, #ff4444);
            color: white;
            padding: 1rem;
            border-radius: 4px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(errorMessage);
        
        setTimeout(() => {
            errorMessage.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => errorMessage.remove(), 300);
        }, 3000);
    }
}

async function removeFromFavorites(gameId) {
    const user = localStorage.getItem('username');
    try {
        const response = await fetch('/api/favorites/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: user,
                gameId: gameId
            })
        });

        if (response.ok) {
            showRemovePopup();
            loadFavorites(); // Reload the favorites list
        } else {
            alert('Failed to remove game from favorites');
        }
    } catch (error) {
        console.error('Error removing from favorites:', error);
        alert('Error removing game from favorites');
    }
}

function showCartPopup() {
    const overlay = document.getElementById('cartPopupOverlay');
    const popup = document.getElementById('cartPopup');
    
    if (overlay && popup) {
        overlay.style.display = 'block';
        popup.style.display = 'block';
        
        // Add fade-in class for animation
        overlay.classList.add('fade-in');
        popup.classList.add('fade-in');
    }
}

function closeCartPopup() {
    const overlay = document.getElementById('cartPopupOverlay');
    const popup = document.getElementById('cartPopup');
    
    if (overlay && popup) {
        overlay.classList.add('fade-out');
        popup.classList.add('fade-out');
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
            overlay.style.display = 'none';
            popup.style.display = 'none';
            overlay.classList.remove('fade-out');
            popup.classList.remove('fade-out');
        }, 300);
    }
}

function showRemovePopup() {
    document.getElementById('removeFavoritesPopupOverlay').style.display = 'block';
    document.getElementById('removeFavoritesPopup').style.display = 'block';
}

function closeRemovePopup() {
    document.getElementById('removeFavoritesPopupOverlay').style.display = 'none';
    document.getElementById('removeFavoritesPopup').style.display = 'none';
}

function goToCart() {
    window.location.href = '/cart';
}

function browse() {
    window.location.href = '/browse';
}

// Wait for components to be loaded before initializing
document.addEventListener('componentsLoaded', initializeFavoritePage);