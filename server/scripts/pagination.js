document.addEventListener('DOMContentLoaded', function() {
    initializeBirthdaySelectors();

    const birthdayForm = document.getElementById('birthdayForm');
    if (birthdayForm) {
        birthdayForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const year = parseInt(document.getElementById('year').value);
            const month = document.getElementById('month').value;
            const day = parseInt(document.getElementById('day').value);
            
            const birthDate = new Date(year, month - 1, day);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const dayDiff = today.getDate() - birthDate.getDate();
    
            if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                age--;
            }
    
            if (age < 12) {
                sessionStorage.setItem('ageRestricted', 'true');
                window.location.href = '/validate-age';
            } else {
                sessionStorage.setItem('ageRestricted', 'false');
                sessionStorage.setItem('userBirthday', `${year}-${month}-${day}`);
                window.location.href = '/register';
            }
        });
    }
});

const logoToggle = document.getElementById('logo');

logoToggle.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href='/';
})

function initializeBirthdaySelectors() {
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');
    const yearSelect = document.getElementById('year');
    
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = String(index + 1).padStart(2, '0'); 
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    
    // Populate days
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = String(i).padStart(2, '0');
        option.textContent = i;
        daySelect.appendChild(option);
    }
    
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 100; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
}

function showLoadingState() {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Loading...';
    }
}

function hideLoadingState() {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = submitButton.dataset.originalText || 'Submit';
    }
}

function showError(message) {
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        document.querySelector('.auth-form').prepend(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}