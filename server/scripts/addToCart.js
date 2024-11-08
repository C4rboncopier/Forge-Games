// Add these functions at the top of the file
function showLoginPopup() {
    document.getElementById('loginPopupOverlay').style.display = 'block';
    document.getElementById('loginPopup').style.display = 'block';
}

function closeLoginPopup() {
    document.getElementById('loginPopupOverlay').style.display = 'none';
    document.getElementById('loginPopup').style.display = 'none';
}

function goToLogin() {
    window.location.href = '/login';
}

// Add this HTML to the game.html file right before the closing body tag
const popupHTML = `
    <div class="popup-overlay" id="popupOverlay"></div>
    <div class="custom-popup" id="customPopup">
        <h2>Game Already Owned</h2>
        <p>This game is already in your library!</p>
        <div class="popup-buttons">
            <button class="view-library-btn" onclick="goToLibrary()">View Library</button>
            <button class="close-btn" onclick="closePopup()">Close</button>
        </div>
    </div>
`;

document.body.insertAdjacentHTML('beforeend', popupHTML);

// Add this HTML template with the other popups at the top
const successPopupHTML = `
    <div class="popup-overlay" id="successPopupOverlay"></div>
    <div class="custom-popup" id="successPopup">
        <h2>Success!</h2>
        <p>Game added to cart successfully!</p>
        <div class="popup-buttons">
            <button class="view-library-btn" onclick="goToCart()">View Cart</button>
            <button class="close-btn" onclick="closeSuccessPopup()">Continue Shopping</button>
        </div>
    </div>
`;

document.body.insertAdjacentHTML('beforeend', successPopupHTML);

// Add this HTML template with the other popups at the top
const alreadyInCartPopupHTML = `
    <div class="popup-overlay" id="cartPopupOverlay"></div>
    <div class="custom-popup" id="cartPopup">
        <h2>Already in Cart</h2>
        <p>This game is already in your cart!</p>
        <div class="popup-buttons">
            <button class="view-library-btn" onclick="goToCart()">View Cart</button>
            <button class="close-btn" onclick="closeCartPopup()">Continue Shopping</button>
        </div>
    </div>
`;

document.body.insertAdjacentHTML('beforeend', alreadyInCartPopupHTML);

// Add these functions with the other popup functions
function showPopup() {
    document.getElementById('popupOverlay').style.display = 'block';
    document.getElementById('customPopup').style.display = 'block';
}

function closePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
    document.getElementById('customPopup').style.display = 'none';
}

function goToLibrary() {
    window.location.href = '/browse';
}

function showSuccessPopup() {
    document.getElementById('successPopupOverlay').style.display = 'block';
    document.getElementById('successPopup').style.display = 'block';
}

function closeSuccessPopup() {
    document.getElementById('successPopupOverlay').style.display = 'none';
    document.getElementById('successPopup').style.display = 'none';
}

function goToCart() {
    window.location.href = '/cart';
}

function showCartPopup() {
    document.getElementById('cartPopupOverlay').style.display = 'block';
    document.getElementById('cartPopup').style.display = 'block';
}

function closeCartPopup() {
    document.getElementById('cartPopupOverlay').style.display = 'none';
    document.getElementById('cartPopup').style.display = 'none';
}

// Update the existing click event listener
document.getElementById('buy-button').addEventListener('click', async (event) => {
    event.preventDefault();
    const user = localStorage.getItem('username');

    if (!user) {
        showLoginPopup();
        return;
    }

    const gameDetails = JSON.parse(sessionStorage.getItem('selectedGame'));
    if (!gameDetails) {
        alert('Error: Game details not found');
        return;
    }

    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: user,
                title: gameDetails.title
            })
        });

        const result = await response.json();

        if (response.status === 409) {
            if (result.error === 'GAME_IN_LIBRARY') {
                showPopup();
            } else {
                showCartPopup();
            }
            return;
        }

        if (result.success) {
            showSuccessPopup();
        } else {
            alert('Failed to add game to cart: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add game to cart');
    }
});

// Close popup when clicking outside
document.getElementById('popupOverlay').addEventListener('click', closePopup);

// Add click event for closing popup when clicking overlay
document.getElementById('loginPopupOverlay').addEventListener('click', closeLoginPopup);

// Add click event for closing popup when clicking overlay
document.getElementById('successPopupOverlay').addEventListener('click', closeSuccessPopup);

// Add click event for closing popup when clicking overlay
document.getElementById('cartPopupOverlay').addEventListener('click', closeCartPopup);