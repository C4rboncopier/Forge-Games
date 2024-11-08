async function loadComponents() {
    try {
        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        if (!headerPlaceholder || !footerPlaceholder) {
            throw new Error('Header or footer placeholder not found');
        }

        const headerResponse = await fetch('/components/header');
        const headerHtml = await headerResponse.text();
        headerPlaceholder.innerHTML = headerHtml;

        const footerResponse = await fetch('/components/footer');
        const footerHtml = await footerResponse.text();
        footerPlaceholder.innerHTML = footerHtml;

        if (!document.querySelector('script[src="/scripts/auth.js"]')) {
            const authScript = document.createElement('script');
            authScript.src = '/scripts/auth.js';
            document.body.appendChild(authScript);

            await new Promise((resolve) => {
                authScript.onload = resolve;
            });
        }

        document.dispatchEvent(new CustomEvent('componentsLoaded'));
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
} 