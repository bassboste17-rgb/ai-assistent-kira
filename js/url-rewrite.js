// ეს ფუნქცია მოშორებს .html გაფართოებას ბრაუზერის მისამართის ზოლიდან
// This function removes the .html extension from the browser's address bar
function removeHtmlExtensionFromURL() {
    // შეამოწმეთ, თუ URL შეიცავს .html
    // Check if URL contains .html
    if (window.location.pathname.endsWith('.html')) {
        // შექმენით ახალი URL .html-ის გარეშე
        // Create new URL without .html
        const newPath = window.location.pathname.replace(/\.html$/, '');
        const newURL = newPath + window.location.search + window.location.hash;
        
        // შეცვალეთ URL ბრაუზერის ისტორიაში (გვერდის გადატვირთვის გარეშე)
        // Change URL in browser history (without page reload)
        window.history.replaceState({}, '', newURL);
    }
}

// გაშვება როდესაც DOM მზად არის
// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeHtmlExtensionFromURL);
} else {
    removeHtmlExtensionFromURL();
}
