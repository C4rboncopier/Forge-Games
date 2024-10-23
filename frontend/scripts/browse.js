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


// Sample games data - replace with your 50 games
const gamesData = [
    { id: 1, title: "Cyberpunk 2077", price: "2,599.00", image: "/assets/main/Cyberpunk 2077.jpg" },
    { id: 2, title: "Baldur's Gate 3", price: "2,599.00", image: "/assets/main/Baldur's Gate 3.jpg" },
    { id: 3, title: "Stardew Valley", price: "419.95", image: "/assets/main/Stardew Valley.jpg" },
    { id: 4, title: "NBA 2K24", price: "2,199.00", image: "/assets/main/NBA 2K24.jpg" },
    { id: 5, title: "A Quiet Place The Road Ahead", price: "419.95", image: "/assets/main/A Quiet Place The Road Ahead.jpg" },
    { id: 6, title: "Black Myth Wukong", price: "419.95", image: "/assets/main/Black Myth Wukong.jpg" },
    { id: 7, title: "Grand Theft Auto V", price: "419.95", image: "/assets/main/Grand Theft Auto V.jpg" },
    { id: 8, title: "Lethal Company", price: "419.95", image: "/assets/main/Lethal Company.jpg" },
    { id: 9, title: "Monster Hunter Wilds", price: "419.95", image: "/assets/main/Monster Hunter Wilds.jpg" },
    { id: 10, title: "Rust", price: "419.95", image: "/assets/main/Rust.jpg" },
    { id: 11, title: "TCG Card Shop Simulator", price: "419.95", image: "/assets/main/TCG Card Shop Simulator.jpg" },
    { id: 12, title: "Tom Clancy's Rainbow Six Siege", price: "419.95", image: "/assets/main/Tom Clancy's Rainbow Six Siege.jpg" },
];

class GamesPagination {
    constructor(gamesPerPage = 12) {
        this.gamesPerPage = gamesPerPage;
        this.currentPage = 1;
        this.totalPages = Math.ceil(gamesData.length / this.gamesPerPage);
        
        this.init();
    }

    init() {
        this.renderGames();
        this.renderPagination();
        this.attachEventListeners();
    }

    getGamesForCurrentPage() {
        const startIndex = (this.currentPage - 1) * this.gamesPerPage;
        const endIndex = startIndex + this.gamesPerPage;
        return gamesData.slice(startIndex, endIndex);
    }

    renderGames() {
        const gamesGrid = document.querySelector('.games-grid');
        const currentGames = this.getGamesForCurrentPage();
        
        gamesGrid.innerHTML = currentGames.map(game => `
            <div class="game-card">
                <img src="${game.image}" alt="${game.title}">
                <div class="game-info">
                    <h3>${game.title}</h3>
                    <p>₱${game.price}</p>
                </div>
            </div>
        `).join('');
    }

    renderPagination() {
        const pagination = document.querySelector('.pagination');
        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <button class="page-button prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>
                Previous
            </button>
        `;

        // First page
        paginationHTML += `
            <button class="page-button page-number ${this.currentPage === 1 ? 'active' : ''}" 
                    data-page="1">
                1
            </button>
        `;

        // Ellipsis and middle pages
        if (this.totalPages > 5) {
            if (this.currentPage > 3) {
                paginationHTML += '<span class="ellipsis">...</span>';
            }

            for (let i = Math.max(2, this.currentPage - 1); 
                 i <= Math.min(this.totalPages - 1, this.currentPage + 1); i++) {
                paginationHTML += `
                    <button class="page-button page-number ${this.currentPage === i ? 'active' : ''}" 
                            data-page="${i}">
                        ${i}
                    </button>
                `;
            }

            if (this.currentPage < this.totalPages - 2) {
                paginationHTML += '<span class="ellipsis">...</span>';
            }
        } else {
            for (let i = 2; i < this.totalPages; i++) {
                paginationHTML += `
                    <button class="page-button page-number ${this.currentPage === i ? 'active' : ''}" 
                            data-page="${i}">
                        ${i}
                    </button>
                `;
            }
        }

        // Last page
        if (this.totalPages > 1) {
            paginationHTML += `
                <button class="page-button page-number ${this.currentPage === this.totalPages ? 'active' : ''}" 
                        data-page="${this.totalPages}">
                    ${this.totalPages}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button class="page-button next-page" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                Next
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    attachEventListeners() {
        const pagination = document.querySelector('.pagination');
        
        pagination.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.classList.contains('page-number')) {
                this.currentPage = parseInt(target.dataset.page);
                this.updateUI();
            } else if (target.classList.contains('prev-page') && this.currentPage > 1) {
                this.currentPage--;
                this.updateUI();
            } else if (target.classList.contains('next-page') && this.currentPage < this.totalPages) {
                this.currentPage++;
                this.updateUI();
            }
        });
    }

    updateUI() {
        this.renderGames();
        this.renderPagination();
        window.scrollTo(0, 0);
    }
}

// Initialize pagination when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GamesPagination(12);
});