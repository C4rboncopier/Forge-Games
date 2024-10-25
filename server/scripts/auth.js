const user = localStorage.getItem('username');

if (user) {
    document.querySelector('.auth-buttons').style.display = 'none';
    document.getElementById('username').textContent = user;
    document.querySelector('.cart-button').style.display = 'flex';
    document.querySelector('.auth-account').style.display = 'flex';
} else {
    document.querySelector('.auth-buttons').style.display = 'flex';
    document.querySelector('.cart-button').style.display = 'none';
    document.querySelector('.auth-account').style.display = 'none';
}

function logout() {
    console.log('Logout function called');
    localStorage.removeItem('username');
    window.location.href = '/';
}

