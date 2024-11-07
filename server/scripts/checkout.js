const checkoutContent = document.getElementById('checkoutContent');
const orderItems = document.getElementById('orderItems');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

const isCheckout = localStorage.getItem('checkout');

// Check if user is logged in and came from cart
if (!user || !isCheckout) {
    window.location.href = '/login';
} else {
    loadCheckoutItems();
}

if (user === 'Admin') {
    window.location.href = '/';
}

menuToggle.addEventListener('click', (event) => {
    event.preventDefault();
    navLinks.classList.toggle('active');
});

function backToCart() {
    window.location.href = '/cart';
}

async function loadCheckoutItems() {
    try {
        const response = await fetch(`/api/cart/${user}`);
        const cartItems = await response.json();

        if (cartItems.length === 0) {
            window.location.href = '/cart';
        } else {
            displayOrderItems(cartItems);
        }
    } catch (error) {
        console.error('Error loading checkout items:', error);
        checkoutContent.innerHTML = '<div class="empty-cart"><h2>Error loading checkout</h2></div>';
    }
}

function displayOrderItems(items) {
    let subtotal = 0;
    
    const itemsHtml = items.map(item => {
        const price = parseFloat(item.price);
        subtotal += price;
        return `
            <div class="order-item">
                <img src="${item.gameUrl || '/assets/placeholder.jpg'}" alt="${item.title}">
                <div class="item-info">
                    <div class="item-name">${item.title}</div>
                    <div class="item-price">₱${price.toFixed(2)}</div>
                </div>
            </div>
        `;
    }).join('');

    orderItems.innerHTML = itemsHtml;

    // Calculate tax and total
    const tax = subtotal * 0.12; // 12% tax
    const total = subtotal + tax;

    // Update summary
    subtotalEl.textContent = `₱${subtotal.toFixed(2)}`;
    taxEl.textContent = `₱${tax.toFixed(2)}`;
    totalEl.textContent = `₱${total.toFixed(2)}`;
}

// Card number formatting
const cardNumber = document.getElementById('cardNumber');
cardNumber.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    
    e.target.value = formattedValue;
});

// Expiry date formatting
const expiry = document.getElementById('expiry');
expiry.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
        value = value.substr(0, 2) + '/' + value.substr(2);
    }
    
    e.target.value = value;
});

// CVV input validation
const cvv = document.getElementById('cvv');
cvv.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Add this after the existing event listeners and before the placeOrderBtn handler
const paymentMethod = document.getElementById('paymentMethod');
const cardDetailsRow = document.querySelector('.form-row');

paymentMethod.addEventListener('change', (e) => {
    const selectedMethod = e.target.value;
    if (selectedMethod === 'gcash' || selectedMethod === 'maya') {
        cardDetailsRow.style.display = 'none';
    } else {
        cardDetailsRow.style.display = 'flex';  // or 'block' depending on your CSS
    }
});

// Place order handler
placeOrderBtn.addEventListener('click', async () => {
    const form = document.getElementById('billingForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    try {
        // Here you would typically make an API call to process the order
        alert('Order placed successfully!');
        // Clear checkout flag and redirect
        localStorage.removeItem('checkout');
        window.location.href = '/';
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Error placing order. Please try again.');
    }
});