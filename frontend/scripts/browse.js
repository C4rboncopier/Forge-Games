const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

const genreSlider = document.querySelector('.genre-slider');
const genreCards = document.querySelector('.genre-cards');
const prevButton = document.querySelector('.genre-navigation').children[0];
const nextButton = document.querySelector('.genre-navigation').children[1];

const cardsPerView = 4;
const totalCards = genreCards.children.length;
let currentPosition = 0;

const slidePercentage = 50;

function initializeCarousel() {
    genreCards.style.transform = 'translateX(0)';
    genreCards.style.transition = 'transform 0.3s ease';
    updateButtonStates();
}

function updateButtonStates() {
    prevButton.disabled = currentPosition === 0;
    prevButton.style.opacity = currentPosition === 0 ? "0.5" : "1";
    prevButton.style.cursor = currentPosition === 0 ? "not-allowed" : "pointer";

    nextButton.disabled = currentPosition === 1;
    nextButton.style.opacity = currentPosition === 1 ? "0.5" : "1";
    nextButton.style.cursor = currentPosition === 1 ? "not-allowed" : "pointer";
}

function moveCarousel(direction) {
    if (direction === 'next' && currentPosition < 1) {
        currentPosition++;
    } else if (direction === 'prev' && currentPosition > 0) {
        currentPosition--;
    }

    const translateValue = -(currentPosition * slidePercentage);
    genreCards.style.transform = `translateX(${translateValue}%)`;
    updateButtonStates();
}

prevButton.addEventListener('click', () => moveCarousel('prev'));
nextButton.addEventListener('click', () => moveCarousel('next'));

initializeCarousel();