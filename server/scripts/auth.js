
document.addEventListener('componentsLoaded', initializeAuth);
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('header')) {
        initializeAuth();
    }
});

function initializeAuth() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.classList.toggle('active');
        });
    }
    
    checkAuth();
}

function checkAuth() {
    const user = localStorage.getItem('username');
    const authButtons = document.querySelector('.auth-buttons');
    const authAccount = document.querySelector('.auth-account');
    const usernameElement = document.getElementById('username');
    const cartButton = document.querySelector('.cart-button');
    const favoriteButton = document.querySelector('.favorite-button');
    const libraryButton = document.getElementById('library-link');
    const supportButton = document.getElementById('support-link');
    
    if (!authButtons || !authAccount || !usernameElement) {
        return;
    }

    console.log(user);

    if (user) {
        authButtons.style.display = 'none';
        authAccount.style.display = 'flex';
        usernameElement.textContent = user;
        if (user === 'Admin'){
            cartButton.style.display = 'none';
            favoriteButton.style.display = 'none';
            libraryButton.style.display = 'none';
            supportButton.style.display = 'none';
        } else {
            cartButton.style.display = 'flex';
            favoriteButton.style.display = 'flex';
            libraryButton.style.display = 'flex';
            supportButton.style.display = 'flex';
        }
    } else {
        authButtons.style.display = 'flex';
        authAccount.style.display = 'none';
        cartButton.style.display = 'none';
        favoriteButton.style.display = 'none';
    }
}

function main() {
    window.location.href = '/';
}

function browse() {
    window.location.href = '/browse';
}

function library() {
    window.location.href = '/library';
}

function support() {
    window.location.href = '/support';
}

function about() {
    window.location.href = '/about';
}

function terms() {
    window.location.href = '/terms';
}

function privacy() {
    window.location.href = '/privacy';
}

function contact() {
    window.location.href = '/contact';
}

function cart() {
    window.location.href = '/cart';
}

function favorite() {
    window.location.href = '/favorite';
}

function login() {
    window.location.href = '/login';
}

function register() {
    window.location.href = '/birthday';
}

function account() {
    const user = localStorage.getItem('username');
    if (user === 'Admin') {
        window.location.href = '/admin';
    } else {
        window.location.href = '/';
    }
}

function logout() {
    localStorage.removeItem('username');
    window.location.href = '/';
}