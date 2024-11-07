async function loadHeader() {
    try {
        const response = await fetch('/components/header.html');
        const html = await response.text();
        document.body.insertAdjacentHTML('afterbegin', html);
        
        // Load and execute auth.js after header is loaded
        const authScript = document.createElement('script');
        authScript.src = '/scripts/auth.js';
        document.body.appendChild(authScript);
        
        // If main.js exists on the page, reload it to reinitialize event listeners
        if (document.querySelector('script[src*="main.js"]')) {
            const mainScript = document.createElement('script');
            mainScript.src = '/scripts/main.js';
            document.body.appendChild(mainScript);
        }
    } catch (error) {
        console.error('Error loading header:', error);
    }
}