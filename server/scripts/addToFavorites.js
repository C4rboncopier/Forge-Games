function showFavoritesPopup(message) {
    const overlay = document.getElementById('favoritesPopupOverlay');
    const popup = document.getElementById('favoritesPopup');
    
    popup.querySelector('h2').textContent = message;
    
    overlay.style.display = 'block';
    popup.style.display = 'block';
}

function closeFavoritesPopup() {
    const overlay = document.getElementById('favoritesPopupOverlay');
    const popup = document.getElementById('favoritesPopup');
    
    overlay.style.display = 'none';
    popup.style.display = 'none';
}

function goToFavorites() {
    window.location.href = '/favorite';
}

async function checkIfInFavorites(username, title) {
    try {
        const response = await fetch(`/api/favorites/${username}`);
        const favorites = await response.json();
        return favorites.some(game => game.title === title);
    } catch (error) {
        console.error('Error checking favorites:', error);
        return false;
    }
}

async function removeFromFavorites(title) {
    const username = localStorage.getItem('username');
    
    try {
        const gameResponse = await fetch('/api/browse/games');
        const games = await gameResponse.json();
        const game = games.find(g => g.title === title);
        
        if (!game) {
            throw new Error('Game not found');
        }

        const response = await fetch('/api/favorites/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, gameId: game.id })
        });

        const data = await response.json();

        if (response.ok) {
            const wishlistButton = document.getElementById('wishlist-button');
            wishlistButton.textContent = 'Add to Favorites';
            showFavoritesPopup('Removed from Favorites');
        } else {
            throw new Error(data.error || 'Failed to remove from favorites');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to remove game from favorites. Please try again.');
    }
}

async function addToFavorites(title) {
    const username = localStorage.getItem('username');
    
    if (!username) {
        document.getElementById('loginPopupOverlay').style.display = 'block';
        document.getElementById('loginPopup').style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/api/favorites/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, title })
        });

        const data = await response.json();

        if (response.ok) {
            const wishlistButton = document.getElementById('wishlist-button');
            wishlistButton.textContent = 'Remove from Favorites';
            showFavoritesPopup('Added to Favorites');
        } else {
            if (data.error === 'Game already in favorites') {
                alert('This game is already in your favorites!');
            } else {
                alert('Failed to add game to favorites. Please try again.');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

document.addEventListener('click', (e) => {
    const overlay = document.getElementById('favoritesPopupOverlay');
    if (e.target === overlay) {
        closeFavoritesPopup();
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const wishlistButton = document.getElementById('wishlist-button');
    if (wishlistButton) {
        const username = localStorage.getItem('username');
        const gameDetails = JSON.parse(sessionStorage.getItem('selectedGame'));
        
        if (username && gameDetails) {
            const isInFavorites = await checkIfInFavorites(username, gameDetails.title);
            if (isInFavorites) {
                wishlistButton.textContent = 'Remove from Favorites';
            }
        }

        wishlistButton.addEventListener('click', async () => {
            const gameDetails = JSON.parse(sessionStorage.getItem('selectedGame'));
            if (gameDetails) {
                if (wishlistButton.textContent === 'Remove from Favorites') {
                    await removeFromFavorites(gameDetails.title);
                } else {
                    await addToFavorites(gameDetails.title);
                }
            }
        });
    }
}); 