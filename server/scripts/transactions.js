const transactionsList = document.querySelector('.transactions-list');
const paginationContainer = document.querySelector('.pagination');
const searchInput = document.getElementById('transactionSearch');
const adminUser = localStorage.getItem('username');

let currentPage = 1;
const transactionsPerPage = 10;
let totalTransactions = [];
let filteredTransactions = [];
let searchTerm = '';

if (adminUser !== 'Admin') {
    window.location.href = '/';
}

function handleSearch(event) {
    searchTerm = event.target.value.toLowerCase();
    filteredTransactions = totalTransactions.filter(transaction => 
        transaction.username.toLowerCase().includes(searchTerm) ||
        transaction.games.toLowerCase().includes(searchTerm)
    );
    
    currentPage = 1;
    displayTransactionsForPage(currentPage);
    updatePagination();
}

async function displayTransactions() {
    try {
        const response = await fetch('/api/admin/transactions', {
            headers: {
                'x-username': adminUser
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch transactions');
        }

        totalTransactions = data.transactions;
        filteredTransactions = totalTransactions;
        displayTransactionsForPage(currentPage);
        updatePagination();
        
    } catch (error) {
        console.error('Error:', error);
        if (error.message.includes('401')) {
            window.location.href = '/';
            return;
        }
        transactionsList.innerHTML = `
            <div class="no-transactions">
                <p>Failed to load transactions. Please try again later.</p>
            </div>
        `;
    }
}

function displayTransactionsForPage(page) {
    const transactions = searchTerm ? filteredTransactions : totalTransactions;
    const startIndex = (page - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    const transactionsToDisplay = transactions.slice(startIndex, endIndex);
    
    transactionsList.innerHTML = '';
    
    if (transactionsToDisplay.length === 0) {
        transactionsList.innerHTML = `
            <div class="no-transactions">
                <p>${searchTerm ? `No transactions found matching "${searchTerm}"` : 'No transactions found.'}</p>
            </div>
        `;
        return;
    }
    
    transactionsToDisplay.forEach(transaction => {
        const date = new Date(transaction.createdat).toLocaleDateString();
        const card = document.createElement('div');
        card.className = 'transaction-card';
        
        card.innerHTML = `
            <div class="transaction-id" data-label="ID">#${transaction.id}</div>
            <div class="transaction-user" data-label="User">${transaction.username}</div>
            <div class="transaction-games" data-label="Games">${transaction.games}</div>
            <div class="transaction-method" data-label="Method">${transaction.method}</div>
            <div class="transaction-total" data-label="Total">₱${parseFloat(transaction.total).toFixed(2)}</div>
            <div class="transaction-date" data-label="Date">${date}</div>
        `;
        
        transactionsList.appendChild(card);
    });
}

function updatePagination() {
    const transactions = searchTerm ? filteredTransactions : totalTransactions;
    const totalPages = Math.ceil(transactions.length / transactionsPerPage);
    
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    const prevButton = document.createElement('button');
    prevButton.className = `pagination-btn prev ${currentPage === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = 'Prev';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayTransactionsForPage(currentPage);
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
            displayTransactionsForPage(currentPage);
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
            displayTransactionsForPage(currentPage);
            updatePagination();
        }
    });
    paginationContainer.appendChild(nextButton);
}

document.addEventListener('DOMContentLoaded', () => {
    searchInput.addEventListener('input', handleSearch);
    displayTransactions();
}); 