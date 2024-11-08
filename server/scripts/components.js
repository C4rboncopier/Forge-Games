async function loadComponents() {
    try {
        // Make sure the placeholder elements exist
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        if (!headerPlaceholder || !footerPlaceholder) {
            throw new Error('Header or footer placeholder not found');
        }

        // Load header
        const headerResponse = await fetch('/components/header');
        const headerHtml = await headerResponse.text();
        headerPlaceholder.innerHTML = headerHtml;

        // Load footer
        const footerResponse = await fetch('/components/footer');
        const footerHtml = await footerResponse.text();
        footerPlaceholder.innerHTML = footerHtml;

        // Initialize auth after header is loaded
        if (!document.querySelector('script[src="/scripts/auth.js"]')) {
            const authScript = document.createElement('script');
            authScript.src = '/scripts/auth.js';
            document.body.appendChild(authScript);

            // Wait for auth script to load
            await new Promise((resolve) => {
                authScript.onload = resolve;
            });
        }

        // Dispatch the componentsLoaded event
        document.dispatchEvent(new CustomEvent('componentsLoaded'));
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// Only attach the event listener if the document hasn't loaded yet
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    // If DOMContentLoaded has already fired, run immediately
    loadComponents();
} 