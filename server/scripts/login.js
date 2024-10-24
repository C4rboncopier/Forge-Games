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