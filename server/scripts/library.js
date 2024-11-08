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

    // Add this new function to handle game redirection
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
}); 