let redirectToGamePage;
let removeFromCart;
let redirectToCheckout;

function initializeCartPage() {
    const user = localStorage.getItem('username');
    const cartContent = document.getElementById('cartContent');
    const searchContainer = document.querySelector('.search-container');
    const searchBar = document.querySelector('.search-bar');
    let searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    
    if (searchContainer) {
        searchContainer.appendChild(searchResults);
    }

    if (!user) {
        window.location.href = '/login';
        return;
    }

    if (user === 'Admin') {
        window.location.href = '/';
        return;
    }

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

    redirectToCheckout = () => {
        localStorage.setItem('checkout', 'true');
        window.location.href = '/checkout';
    };

    removeFromCart = async (gameId) => {
        try {
            const response = await fetch(`/api/cart/remove`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: user,
                    gameId: gameId
                })
            });

            if (response.ok) {
                loadCart();
            } else {
                alert('Failed to remove item from cart');
            }
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Error removing item from cart');
        }
    };

    let games = [];
    let searchTimeout;

    async function loadCart() {
        try {
            const response = await fetch(`/api/cart/${user}`);
            const cartItems = await response.json();

            if (cartItems.length === 0) {
                showEmptyCart();
            } else {
                showCartItems(cartItems);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            cartContent.innerHTML = '<div class="empty-cart"><h2>Error loading cart</h2></div>';
        }
    }

    function showEmptyCart() {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any games yet.</p>
                <a href="/browse" class="continue-shopping">Continue Shopping</a>
            </div>
        `;
    }

    function showCartItems(items) {
        let total = 0;
        const itemsHtml = items.map(item => {
            total += parseFloat(item.price);
            return `
                <div class="cart-item">
                    <img src="${item.gameUrl || '/assets/placeholder.jpg'}" alt="${item.title}">
                    <div class="item-details">
                        <h3 class="item-title">${item.title}</h3>
                        <p class="item-price">₱${parseFloat(item.price).toFixed(2)}</p>
                    </div>
                    <button class="remove-button" onclick="removeFromCart('${item.id}')">
                        Remove
                    </button>
                </div>
            `;
        }).join('');

        cartContent.innerHTML = `
            <div class="cart-header">
                <h1 class="cart-title">Shopping Cart (${items.length} ${items.length === 1 ? 'item' : 'items'})</h1>
            </div>
            <div class="cart-items">
                ${itemsHtml}
            </div>
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>₱${total.toFixed(2)}</span>
                </div>
                <div class="summary-row summary-total">
                    <span>Total</span>
                    <span>₱${total.toFixed(2)}</span>
                </div>
                <button class="checkout-button" onclick="redirectToCheckout()">
                    Proceed to Checkout
                </button>
            </div>
        `;
    }

    if (searchBar && searchContainer) {
        fetch('/api/browse/games')
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

    loadCart();
}

window.removeFromCart = removeFromCart;
window.redirectToCheckout = redirectToCheckout;

document.addEventListener('componentsLoaded', initializeCartPage);