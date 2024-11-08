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

    console.log('Adding to cart:', {
        username: user,
        gameId: gameDetails.id,
        gameTitle: gameDetails.title
    });

    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: user,
                gameId: gameDetails.id,
                game: {
                    title: gameDetails.title
                }
            })
        });

        if (!response.ok) {
            const result = await response.json();
            if (response.status === 409) {
                if (result.error === 'GAME_IN_LIBRARY') {
                    showPopup();
                } else if (result.error === 'Game already exists in cart') {
                    showCartPopup();
                }
                return;
            }
            throw new Error(result.error || 'Failed to add game to cart');
        }

        const result = await response.json();
        if (result.success) {
            showSuccessPopup();
        } else {
            alert('Failed to add game to cart: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add game to cart: ' + error.message);
    }
});

document.getElementById('popupOverlay').addEventListener('click', closePopup);

document.getElementById('loginPopupOverlay').addEventListener('click', closeLoginPopup);

document.getElementById('successPopupOverlay').addEventListener('click', closeSuccessPopup);

document.getElementById('cartPopupOverlay').addEventListener('click', closeCartPopup);