const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', (event) => {
    event.preventDefault();
    navLinks.classList.toggle('active');
});

const genreSlider = document.querySelector('.genre-slider');
const genreCards = document.querySelector('.genre-cards');
const prevButton = document.querySelector('.genre-navigation').children[0];
const nextButton = document.querySelector('.genre-navigation').children[1];

let currentPosition = 0;
let isMobile = window.innerWidth <= 800;
let maxPosition = isMobile ? 3 : 1; // 4 slides for mobile (2 cards each), 2 slides for desktop (4 cards each)
let slidePercentage = isMobile ? 25 : 50; // 25% for mobile, 50% for desktop

function initializeCarousel() {
    genreCards.style.transform = 'translateX(0)';
    genreCards.style.transition = 'transform 0.3s ease';
    updateButtonStates();
}

function updateButtonStates() {
    prevButton.disabled = currentPosition === 0;
    prevButton.style.opacity = currentPosition === 0 ? "0.5" : "1";
    prevButton.style.cursor = currentPosition === 0 ? "not-allowed" : "pointer";

    nextButton.disabled = currentPosition === maxPosition;
    nextButton.style.opacity = currentPosition === maxPosition ? "0.5" : "1";
    nextButton.style.cursor = currentPosition === maxPosition ? "not-allowed" : "pointer";
}

function moveCarousel(direction) {
    if (direction === 'next' && currentPosition < maxPosition) {
        currentPosition++;
    } else if (direction === 'prev' && currentPosition > 0) {
        currentPosition--;
    }

    const translateValue = -(currentPosition * slidePercentage);
    genreCards.style.transform = `translateX(${translateValue}%)`;
    updateButtonStates();
}

function handleResize() {
    const wasDesktop = !isMobile;
    isMobile = window.innerWidth <= 800;
    
    // Only update if the breakpoint was crossed
    if (wasDesktop !== !isMobile) {
        maxPosition = isMobile ? 3 : 1;
        slidePercentage = isMobile ? 25 : 50;
        
        // Reset position if current position is beyond new max
        if (currentPosition > maxPosition) {
            currentPosition = maxPosition;
        }
        
        const translateValue = -(currentPosition * slidePercentage);
        genreCards.style.transform = `translateX(${translateValue}%)`;
        updateButtonStates();
    }
}

prevButton.addEventListener('click', () => moveCarousel('prev'));
nextButton.addEventListener('click', () => moveCarousel('next'));
window.addEventListener('resize', handleResize);

initializeCarousel();
handleResize();

const paginationContainer = document.querySelector('.pagination');
let currentPage = 1;
const gamesPerPage = 12;
let totalGames = [];
let filteredGames = [];
let searchTerm = '';
let selectedGenre = '';

function handleSearch(event) {
    searchTerm = event.target.value.toLowerCase();
    filterGames();
}

function handleGenreFilter(event) {
    selectedGenre = event.target.value.toLowerCase();
    filterGames();
}

function filterGames() {
    filteredGames = totalGames.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchTerm);
        const matchesGenre = selectedGenre ? game.genre.toLowerCase() === selectedGenre : true;
        return matchesSearch && matchesGenre;
    });

    currentPage = 1;
    displayGamesForPage(currentPage);
    updatePagination();
}

async function displayGames() {
    try {
        const response = await fetch('/api/admin/games');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        totalGames = await response.json();
        
        displayGamesForPage(currentPage);
        updatePagination();
        
    } catch (error) {
        console.error('Error fetching games:', error);
        gamesList.innerHTML = '<p class="error-message">Failed to load games</p>';
    }
}

function displayGamesForPage(page) {
    const gamesToUse = searchTerm || selectedGenre ? filteredGames : totalGames;
    const startIndex = (page - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    const gamesToDisplay = gamesToUse.slice(startIndex, endIndex);
    
    gamesList.innerHTML = '';
    
    if (gamesToDisplay.length === 0) {
        gamesList.innerHTML = `
            <div class="no-results">
                <p>No games found matching your criteria</p>
            </div>`;
        return;
    }
    
    gamesToDisplay.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        
        const imageUrl = game.gameUrl;
        
        gameCard.innerHTML = `
            <div class="game-image-container">
                <img src="${imageUrl}" 
                    alt="${game.title}"
                    onerror="this.src='/assets/placeholder-game.png'">
            </div>
            <div class="game-info">
                <h3>${game.title}</h3>
                <p class="game-developer">${game.developer}</p>
                <p class="game-genre">${game.genre}</p>
                <p class="game-price">₱${parseFloat(game.price).toFixed(2)}</p>
            </div>
        `;
        
        gameCard.addEventListener('click', () => {
            redirectToGamePage(game);
        });
        
        gamesList.appendChild(gameCard);
    });
}

function updatePagination() {
    const gamesToUse = searchTerm || selectedGenre ? filteredGames : totalGames;
    const totalPages = Math.ceil(gamesToUse.length / gamesPerPage);
    
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `pagination-btn prev ${currentPage === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = 'Prev';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayGamesForPage(currentPage);
            updatePagination();
        }
    });
    paginationContainer.appendChild(prevButton);
    
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-btn page-number ${currentPage === i ? 'active' : ''}`;
        pageButton.innerHTML = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayGamesForPage(currentPage);
            updatePagination();
        });
        paginationContainer.appendChild(pageButton);
    }
    
    const nextButton = document.createElement('button');
    nextButton.className = `pagination-btn next ${currentPage === totalPages ? 'disabled' : ''}`;
    nextButton.innerHTML = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayGamesForPage(currentPage);
            updatePagination();
        }
    });
    paginationContainer.appendChild(nextButton);
}

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

function filterByGenre(genre) {
    window.location.href = `/genre/${genre}`;
}

document.addEventListener('DOMContentLoaded', function() {
    const searchContainer = document.querySelector('.search-container');
    const searchBar = document.querySelector('.search-bar');
    let searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchContainer.appendChild(searchResults);
    
    let games = []; // Will store all games data
    let searchTimeout;

    // Fetch games data when page loads
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

    document.getElementById('gameSearch').addEventListener('input', handleSearch);
    document.getElementById('genreFilter').addEventListener('change', handleGenreFilter);

    displayGames();
});
