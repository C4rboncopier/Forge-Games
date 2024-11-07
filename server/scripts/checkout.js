const checkoutContent = document.getElementById('checkoutContent');
const orderItems = document.getElementById('orderItems');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const orderPopup = document.getElementById('orderPopup');
const closePopupBtn = document.getElementById('closePopupBtn');

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
    const cardDetailsSection = document.getElementById('cardDetails');
    const cardInputs = cardDetailsSection.querySelectorAll('input');
    const cardNumberGroup = document.querySelector('.form-group:has(#cardNumber)');
    
    if (selectedMethod === 'gcash' || selectedMethod === 'maya') {
        cardDetailsRow.style.display = 'none';
        cardNumberGroup.style.display = 'none';
        cardInputs.forEach(input => {
            input.removeAttribute('required');
        });
        
        if (!document.getElementById('phoneNumber')) {
            const phoneGroup = document.createElement('div');
            phoneGroup.className = 'form-group';
            phoneGroup.innerHTML = `
                <label for="phoneNumber">Phone Number</label>
                <input type="tel" id="phoneNumber" placeholder="09XX XXX XXXX" required>
                <span class="error-message">Phone number must start with 09</span>
            `;
            cardDetailsSection.insertBefore(phoneGroup, cardDetailsRow);
            
            // Updated phone number validation
            const phoneInput = document.getElementById('phoneNumber');
            const errorMessage = phoneInput.nextElementSibling;
            
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                // Limit to 11 digits
                if (value.length > 11) {
                    value = value.slice(0, 11);
                }
                
                // Format with spaces
                if (value.length > 4) {
                    value = value.slice(0, 4) + ' ' + value.slice(4);
                }
                if (value.length > 8) {
                    value = value.slice(0, 8) + ' ' + value.slice(8);
                }
                
                e.target.value = value;
                
                // Show error if number doesn't start with 09
                if (value.length >= 2) {
                    if (!value.startsWith('09')) {
                        errorMessage.style.display = 'block';
                        phoneInput.style.borderColor = 'rgb(255, 67, 67)';
                        phoneInput.setCustomValidity('Phone number must start with 09');
                    } else {
                        errorMessage.style.display = 'none';
                        phoneInput.style.borderColor = '';  // Remove inline style to allow CSS hover
                        phoneInput.setCustomValidity('');
                    }
                } else {
                    errorMessage.style.display = 'none';
                    phoneInput.style.borderColor = '';  // Remove inline style to allow CSS hover
                    phoneInput.setCustomValidity('');
                }
            });
        }
    } else {
        cardDetailsRow.style.display = 'grid';
        cardNumberGroup.style.display = 'block';
        cardInputs.forEach(input => {
            input.setAttribute('required', '');
        });
        
        const phoneGroup = document.getElementById('phoneNumber')?.parentElement;
        if (phoneGroup) {
            phoneGroup.remove();
        }
    }
});

// Place order handler
placeOrderBtn.addEventListener('click', async () => {
    const form = document.getElementById('billingForm');
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    if (paymentMethod === 'gcash' || paymentMethod === 'maya') {
        const phoneInput = document.getElementById('phoneNumber');
        const phoneNumber = phoneInput.value.replace(/\s/g, '');
        
        // Validate Philippine phone number format (09XX XXX XXXX)
        const phoneRegex = /^09\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            alert('Please enter a valid Philippine phone number (09XX XXX XXXX)');
            return;
        }
    }

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    try {
        const paymentMethod = document.getElementById('paymentMethod').value;
        
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: user,
                paymentMethod: paymentMethod
            })
        });

        const data = await response.json();
        
        if (data.success) {
            orderPopup.classList.remove('hidden');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Error placing order. Please try again.');
    }
});

closePopupBtn.addEventListener('click', () => {
    orderPopup.classList.add('hidden');
    // Clear checkout flag and redirect
    localStorage.removeItem('checkout');
    window.location.href = '/';
});