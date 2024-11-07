// DOM Elements
const addGameForm = document.getElementById('addGameForm');
const gamesList = document.getElementById('gamesList');
const paginationContainer = document.querySelector('.pagination');
const user = localStorage.getItem('username');
const isCheckout = localStorage.getItem('checkout');


let edit = false;
let currentPage = 1;
const gamesPerPage = 9;
let totalGames = [];
let filteredGames = [];
let searchTerm = '';

let currentBannerName = '';
let currentScreenshot1Name = '';
let currentScreenshot2Name = '';
let currentScreenshot3Name = '';

function main() {
    window.location.href = '/';
}

function browse() {
    window.location.href = '/browse';
}

function logout() {
    console.log('Logout function called');
    localStorage.removeItem('username');
    window.location.href = '/';
}

if (user !== 'Admin') {
    window.location.href = '/';
}

// Function to reset form to add mode
function resetFormToAddMode() {
    const submitButton = addGameForm.querySelector('button[type="submit"]');
    const cancelButton = addGameForm.querySelector('.cancel-btn');
    
    addGameForm.reset();
    
    document.getElementById('main-image-preview').src = '/assets/placeholder-game.png';
    document.getElementById('banner-preview').src = '/assets/placeholder-game.png';
    document.getElementById('screenshot1-preview').src = '/assets/placeholder-game.png';
    document.getElementById('screenshot2-preview').src = '/assets/placeholder-game.png';
    document.getElementById('screenshot3-preview').src = '/assets/placeholder-game.png';

    submitButton.textContent = 'Add Game';
    delete addGameForm.dataset.editMode;
    delete addGameForm.dataset.editId;
    
    if (cancelButton) {
        cancelButton.remove();
    }

    // Reset current image names
    currentImageName = '';
    currentBannerName = '';
    currentScreenshot1Name = '';
    currentScreenshot2Name = '';
    currentScreenshot3Name = '';

    // Clear any input fields that might not have been reset
    const inputs = addGameForm.querySelectorAll('input[type="text"], input[type="number"], textarea, select');
    inputs.forEach(input => {
        input.value = '';
    });
}

// Function to set form to edit mode
function setFormToEditMode(submitButton) {
    submitButton.textContent = 'Update Game';
    
    if (!addGameForm.querySelector('.cancel-btn')) {
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'cancel-btn';
        cancelButton.textContent = 'Cancel';
        
        submitButton.parentNode.insertBefore(cancelButton, submitButton);
        
        cancelButton.addEventListener('click', (e) => {
            e.preventDefault();
            resetFormToAddMode();
        });
    }
}

// Add this function to handle search
function handleSearch(event) {
    searchTerm = event.target.value.toLowerCase();
    filteredGames = totalGames.filter(game => 
        game.title.toLowerCase().includes(searchTerm) ||
        game.developer.toLowerCase().includes(searchTerm) ||
        game.genre.toLowerCase().includes(searchTerm)
    );
    
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
    const gamestoUse = searchTerm ? filteredGames : totalGames;
    const startIndex = (page - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    const gamesToDisplay = gamestoUse.slice(startIndex, endIndex);
    
    gamesList.innerHTML = '';
    
    if (gamesToDisplay.length === 0) {
        gamesList.innerHTML = `
            <div class="no-results">
                <p>No games found matching "${searchTerm}"</p>
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
            <div class="admin-actions">
                <button class="edit-btn" data-id="${game.id}">Edit</button>
                <button class="delete-btn" data-id="${game.id}">Delete</button>
            </div>
        `;
        
        // Click event for game-image-container
        gameCard.querySelector('.game-image-container').addEventListener('click', () => {
            redirectToGamePage(game);
        });
        
        // Click event for game-info
        gameCard.querySelector('.game-info').addEventListener('click', () => {
            redirectToGamePage(game);
        });
        
        gamesList.appendChild(gameCard);
    });
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            edit = true;
            editGame(button.dataset.id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            deleteGame(button.dataset.id);
        });
    });
}

// Function to handle redirection with selected game details
function redirectToGamePage(game) {
    sessionStorage.setItem('selectedGame', JSON.stringify({
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
    window.location.href = '/game';
}

// Modify the updatePagination function to use filtered results
function updatePagination() {
    const gamestoUse = searchTerm ? filteredGames : totalGames;
    const totalPages = Math.ceil(gamestoUse.length / gamesPerPage);
    
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

// Update filename display
function updateImagePreview(input, previewId) {
    const preview = document.getElementById(previewId);
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
        }
        
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.src = '/assets/placeholder-game.png';
    }
}

// Update the event listeners for file inputs
document.getElementById('add-image').addEventListener('change', function() {
    updateImagePreview(this, 'main-image-preview');
});

document.getElementById('banner').addEventListener('change', function() {
    updateImagePreview(this, 'banner-preview');
});

document.getElementById('screenshot1').addEventListener('change', function() {
    updateImagePreview(this, 'screenshot1-preview');
});

document.getElementById('screenshot2').addEventListener('change', function() {
    updateImagePreview(this, 'screenshot2-preview');
});

document.getElementById('screenshot3').addEventListener('change', function() {
    updateImagePreview(this, 'screenshot3-preview');
});


// Form submission
addGameForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();

    const fileInput = document.getElementById("add-image");
    const bannerInput = document.getElementById("banner");
    const screenshot1Input = document.getElementById("screenshot1");
    const screenshot2Input = document.getElementById("screenshot2");
    const screenshot3Input = document.getElementById("screenshot3");
    const submitButton = this.querySelector('button[type="submit"]');
    const isEditMode = this.dataset.editMode === 'true';

    // Only check for required images in add mode
    if (!isEditMode && (!fileInput.files.length ||
        !bannerInput.files.length ||
        !screenshot1Input.files.length ||
        !screenshot2Input.files.length ||
        !screenshot3Input.files.length)) {
        alert("Please select all required images to upload.");
        return;
    }

    submitButton.disabled = true;

    try {
        // Check if the title already exists
        const response2 = await fetch('/api/admin/games');
        if (!response2.ok) {
            throw new Error(`HTTP error! status: ${response2.status}`);
        }
        const games = await response2.json();
        
        // Check if a game with the same title already exists
        const existingGame = games.find(game => game.title.toLowerCase() === title.toLowerCase());
        if (existingGame && !isEditMode) {
            alert('A game with this title already exists. Please use a different title.');
            submitButton.disabled = false;
            return;
        }
        
        const formData = new FormData();
        formData.append('title', document.getElementById('title').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('developer', document.getElementById('developer').value);
        formData.append('genre', document.getElementById('genre').value);
        formData.append('price', document.getElementById('price').value);

        // Handle main image
        if (fileInput.files.length > 0) {
            const mainFile = fileInput.files[0];
            formData.append('image', mainFile);
            formData.append('image_name', mainFile.name);
        } else if (isEditMode && currentImageName) {
            formData.append('image_name', currentImageName);
        }

        // Handle banner
        if (bannerInput.files.length > 0) {
            const bannerFile = bannerInput.files[0];
            formData.append('banner', bannerFile);
            formData.append('banner_name', `banner_${bannerFile.name}`);
        } else if (isEditMode && currentBannerName) {
            formData.append('banner_name', currentBannerName);
        }

        // Handle screenshot1
        if (screenshot1Input.files.length > 0) {
            const screenshot1File = screenshot1Input.files[0];
            formData.append('screenshot1', screenshot1File);
            formData.append('screenshot1_name', `screenshot1_${screenshot1File.name}`);
        } else if (isEditMode && currentScreenshot1Name) {
            formData.append('screenshot1_name', currentScreenshot1Name);
        }

        // Handle screenshot2
        if (screenshot2Input.files.length > 0) {
            const screenshot2File = screenshot2Input.files[0];
            formData.append('screenshot2', screenshot2File);
            formData.append('screenshot2_name', `screenshot2_${screenshot2File.name}`);
        } else if (isEditMode && currentScreenshot2Name) {
            formData.append('screenshot2_name', currentScreenshot2Name);
        }

        // Handle screenshot3
        if (screenshot3Input.files.length > 0) {
            const screenshot3File = screenshot3Input.files[0];
            formData.append('screenshot3', screenshot3File);
            formData.append('screenshot3_name', `screenshot3_${screenshot3File.name}`);
        } else if (isEditMode && currentScreenshot3Name) {
            formData.append('screenshot3_name', currentScreenshot3Name);
        }

        const url = isEditMode 
            ? `/admin/games/${this.dataset.editId}`
            : '/admin/upload';
        
        const response = await fetch(url, {
            method: isEditMode ? 'PUT' : 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            alert(isEditMode ? 'Game updated successfully!' : 'Game added successfully!');
            resetFormToAddMode();
            await displayGames();
        } else {
            throw new Error(result.error || 'Failed to save game');
        }
    } catch (error) {
        console.error('Error saving game:', error);
        alert('Failed to save game: ' + error.message);
    } finally {
        submitButton.disabled = false;
    }
});

async function deleteGame(gameId) {
    if (!confirm('Are you sure you want to delete this game?')) {
        return;
    }

    try {
        const response = await fetch(`/admin/games/${gameId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const result = await response.json();

            if (result.success) {
                alert('Game deleted successfully!');
                window.location.href = '/admin'
                await displayGames();
            } else {
                alert(result.error || 'Failed to delete game');
            }
        } else {
            // If no JSON, assume success if no error was thrown
            alert('Game deleted successfully!');
            await displayGames();
        }
    } catch (error) {
    }
}


async function editGame(gameId) {
    try {
        const response = await fetch(`/api/admin/games/${gameId}`);
        const contentType = response.headers.get('content-type');
        
        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                }
            } catch (e) {
                console.error('Error parsing error response:', e);
            }
            throw new Error(errorMessage);
        }
        
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Invalid response format from server');
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch game details');
        }
        
        const game = result.data;
        if (!game) {
            throw new Error('No game data received');
        }
        
        document.getElementById('title').value = game.title || '';
        document.getElementById('description').value = game.description || '';
        document.getElementById('developer').value = game.developer || '';
        document.getElementById('genre').value = game.genre || '';
        document.getElementById('price').value = game.price || '';
        
        document.getElementById('main-image-preview').src = game.gameUrl;
        currentImageName = game.image_name;

        document.getElementById('banner-preview').src = game.bannerUrl || '/assets/placeholder-game.png';
        currentBannerName = game.banner_name;

        document.getElementById('screenshot1-preview').src = game.screenshot1Url;
        currentScreenshot1Name = game.screenshot1;

        document.getElementById('screenshot2-preview').src = game.screenshot2Url;
        currentScreenshot2Name = game.screenshot2;

        document.getElementById('screenshot3-preview').src = game.screenshot3Url;
        currentScreenshot3Name = game.screenshot3;
        
        const submitButton = addGameForm.querySelector('button[type="submit"]');
        setFormToEditMode(submitButton);
        addGameForm.dataset.editMode = 'true';
        addGameForm.dataset.editId = gameId;
        
        addGameForm.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Detailed error in editGame:', {
            message: error.message,
            stack: error.stack,
            gameId
        });
        alert(`Failed to load game details: ${error.message}`);
    }
}

// Initialize search when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log(localStorage.getItem('username'));
    sessionStorage.clear();
    const searchInput = document.createElement('div');
    searchInput.className = 'search-container';
    searchInput.innerHTML = `
        <input type="text" 
                id="gameSearch" 
                placeholder="Search games by title, developer, or genre..." 
                class="search-input">
    `;
    
    const gamesGrid = document.getElementById('gamesList');
    gamesGrid.parentNode.insertBefore(searchInput, gamesGrid);
    
    document.getElementById('gameSearch').addEventListener('input', handleSearch);
    
    displayGames();
});