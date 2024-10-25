initializeCountrySelector()
document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Capture form data
    const country = document.getElementById('country').value;
    const email = document.getElementById('email').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Check if passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Prepare payload for submission
    const payload = {
        username: username,
        password: password,
        firstname: firstName,
        lastname: lastName,
        email: email,
        country: country,
        role: 'User' // Set default role, if applicable
    };

    try {
        // Send POST request to the server
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert(result.message);
            window.location.href = "/login"; // Redirect to login on successful registration
        } else {
            alert(result.message || 'Error creating account');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('An error occurred. Please try again later.');
    }
});

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
