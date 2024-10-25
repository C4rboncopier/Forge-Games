const togglePassword = document.querySelector("#togglePassword");
const passwordField = document.querySelector("#password");
const icon = togglePassword.querySelector("i");

togglePassword.addEventListener("click", function () {
    // Toggle the type attribute
    const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);
    
    // Toggle the icon
    if (type === "password") {
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
        togglePassword.style.right = "15px"; // Reset to original position
    } else {
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
        togglePassword.style.right = "14px"; // Move 5px to the right
    }
});

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();  // Prevent the form from submitting in the default way

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.success) {
            // If login is successful, redirect to the homepage or dashboard
            window.location.href = '/';
        } else {
            // Show an alert if the login fails
            alert(result.message);
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('An error occurred while logging in. Please try again.');
    }
});

