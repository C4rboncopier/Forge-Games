document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        country: document.getElementById('country').value
    };

    try {
        const result = await handleRegistration(formData);
        if (result.success) {
            alert('Registration successful!');
        }
    } catch (error) {
        console.error(error);
        alert('Registration failed.');
    }
});
