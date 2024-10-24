document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    
    
    const birthdayForm = document.getElementById('birthdayForm');
    if (birthdayForm) {
        initializeBirthdaySelectors();
        
        birthdayForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const year = parseInt(document.getElementById('year').value);
            const month = document.getElementById('month').value;
            const day = parseInt(document.getElementById('day').value);
            
            const birthDate = new Date(year, month - 1, day);  // Adjust month to 0-based index
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const dayDiff = today.getDate() - birthDate.getDate();
    
            // Adjust age if birth month/day hasn't occurred yet this year
            if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                age--;
            }
    
            if (age < 12) {
                window.location.href = '/validate-age';
            } else {
                // Store birthday in session storage for registration
                sessionStorage.setItem('userBirthday', `${year}-${month}-${day}`);
                window.location.href = '/register';
            }
        });
    }

    if (registerForm) {
        initializeCountrySelector();
        
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (validateRegistrationForm()) {
                const formData = {
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value,
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    username: document.getElementById('username').value,
                    country: document.getElementById('country').value,
                    birthday: sessionStorage.getItem('userBirthday')
                };

                try {
                    showLoadingState();
                    await handleRegistration(formData);
                    window.location.href = 'login.html';
                } catch (error) {
                    showError(error.message);
                } finally {
                    hideLoadingState();
                }
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                showLoadingState();
                await handleLogin(email, password);
                window.location.href = 'index.html';
            } catch (error) {
                showError(error.message);
            } finally {
                hideLoadingState();
            }
        });
    }
});



function initializeBirthdaySelectors() {
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');
    const yearSelect = document.getElementById('year');
    
    // Populate months
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = String(index + 1).padStart(2, '0'); // 01, 02, etc.
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    
    // Populate days
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = String(i).padStart(2, '0'); // 01, 02, etc.
        option.textContent = i;
        daySelect.appendChild(option);
    }
    
    // Populate years (100 years back from current year)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 100; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
}

function initializeCountrySelector() {
    const countrySelect = document.getElementById('country');
    
    // Sample list of countries - expand as needed
    const countries = [
        'United States', 'Canada', 'United Kingdom', 'Australia',
        'Germany', 'France', 'Japan', 'Brazil', 'Philippines'
    ].sort();
    
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}

function validateRegistrationForm() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    
    if (password !== confirmPassword) {
        showError('Passwords do not match!');
        return false;
    }
    
    if (!terms) {
        showError('Please agree to the Terms of Service');
        return false;
    }
    
    return true;
}

function showLoadingState() {
    // Disable submit button and show loading spinner
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Loading...';
    }
}

function hideLoadingState() {
    // Re-enable submit button and restore text
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = submitButton.dataset.originalText || 'Submit';
    }
}

function showError(message) {
    // Create or update error message element
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        document.querySelector('.auth-form').prepend(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}