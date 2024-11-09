const togglePassword = document.querySelector("#togglePassword");
const passwordField = document.querySelector("#password");
const icon = togglePassword.querySelector("i");

togglePassword.addEventListener("click", function () {
    const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);
    
    if (type === "password") {
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
        togglePassword.style.right = "15px";
    } else {
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
        togglePassword.style.right = "14px";
    }
});

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

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
            localStorage.setItem('username', result.user.username);
            if (result.user.username === 'Admin') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/';
            }
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('An error occurred while logging in. Please try again.');
    }
});


