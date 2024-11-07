document.getElementById('buy-button').addEventListener('click', async (event) => {
    event.preventDefault();

    if (!user) {
        alert('Please log in to add items to cart');
        window.location.href = '/login';
        return;
    }

    const gameDetails = JSON.parse(sessionStorage.getItem('selectedGame'));
    if (!gameDetails) {
        alert('Error: Game details not found');
        return;
    }

    try {
        // Send only the required data
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
            alert('This game is already in your cart');
            return;
        }

        if (result.success) {
            alert('Game added to cart successfully!');
        } else {
            alert('Failed to add game to cart: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add game to cart');
    }
});