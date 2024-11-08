const user = localStorage.getItem('username');
console.log(localStorage.getItem('username'));

if (user) {
    document.querySelector('.auth-buttons').style.display = 'none';
    document.getElementById('username').textContent = user;
    document.querySelector('.auth-account').style.display = 'flex';
    if (user === 'Admin'){
        document.querySelector('.cart-button').style.display = 'none';
    } else {
        document.querySelector('.cart-button').style.display = 'flex';
    }
} else {
    document.querySelector('.auth-buttons').style.display = 'flex';
    document.querySelector('.cart-button').style.display = 'none';
    document.querySelector('.auth-account').style.display = 'none';
}

function main() {
    window.location.href = '/';
}

function login() {
    window.location.href = '/login';
}

function register() {
    window.location.href = '/birthday';
}

function account() {
    if (user === 'Admin') {
        window.location.href = '/admin';
    } else {
        window.location.href = '/';
    }
}

function browse() {
    window.location.href = '/browse';
}

function cart() {
    window.location.href = '/cart';
}

function library() {
    window.location.href = '/library';
}

function logout() {
    console.log('Logout function called');
    localStorage.removeItem('username');
    window.location.href = '/';
}

function favorite() {
    window.location.href = '/favorite';
}