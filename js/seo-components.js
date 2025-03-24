/**
 * SEO Components Script
 * For handling breadcrumb navigation and other SEO-related functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize breadcrumb navigation
    initBreadcrumbs();
    
    // Add event handlers for footer links
    initFooterLinks();
});

/**
 * Initialize breadcrumb navigation
 * Dynamically generates breadcrumb navigation based on current page URL
 */
function initBreadcrumbs() {
    // Get breadcrumb navigation elements
    const breadcrumbCategory = document.querySelector('.breadcrumb-category');
    const breadcrumbCurrent = document.querySelector('.breadcrumb-current');
    
    if (!breadcrumbCategory || !breadcrumbCurrent) return;
    
    // Get current page path
    const path = window.location.pathname;
    const pageName = path.split('/').pop();
    
    // Set current page name
    let pageTitle = document.title;
    if (pageTitle.includes(' - ')) {
        pageTitle = pageTitle.split(' - ')[0];
    }
    breadcrumbCurrent.querySelector('[itemprop="name"]').textContent = pageTitle;
    
    // Set category based on page type
    let category = 'Games';
    let categoryUrl = '/';
    
    // Determine category type based on filename
    if (pageName.includes('snake')) {
        category = 'Arcade Games';
        categoryUrl = '/category/arcade.html';
    } else if (pageName.includes('air') || pageName.includes('flight')) {
        category = 'Simulation Games';
        categoryUrl = '/category/simulation.html';
    } else if (pageName.includes('adventure')) {
        category = 'Adventure Games';
        categoryUrl = '/category/adventure.html';
    } else if (pageName.includes('stickman') || pageName.includes('gta')) {
        category = 'Action Games';
        categoryUrl = '/category/action.html';
    } else if (pageName.includes('minesweeper') || pageName.includes('saolei')) {
        category = 'Puzzle Games';
        categoryUrl = '/category/puzzle.html';
    } else if (pageName.includes('monster') || pageName.includes('survivors')) {
        category = 'Survival Games';
        categoryUrl = '/category/survival.html';
    }
    
    // Set category information
    const categoryNameElement = breadcrumbCategory.querySelector('[itemprop="name"]');
    const categoryLinkElement = breadcrumbCategory.querySelector('[itemprop="item"]');
    
    if (categoryNameElement) categoryNameElement.textContent = category;
    if (categoryLinkElement) categoryLinkElement.href = categoryUrl;
    
    // Special handling for homepage
    if (path === '/' || path === '/index.html') {
        breadcrumbCategory.style.display = 'none';
        breadcrumbCurrent.querySelector('[itemprop="name"]').textContent = 'All Games';
    }
}

/**
 * Initialize footer links
 */
function initFooterLinks() {
    // Add click event handlers if linked pages don't exist yet
    const footerLinks = document.querySelectorAll('.footer-links a');
    
    footerLinks.forEach(link => {
        const href = link.getAttribute('href');
        // Check if the linked page exists
        if (!['/about.html', '/contact.html', '/privacy-policy.html', '/terms-of-service.html'].includes(href)) {
            link.addEventListener('click', function(e) {
                // Prevent default action for pages that don't exist yet
                if (!link.hasAttribute('data-exists')) {
                    e.preventDefault();
                    alert('This page is under construction. Please check back soon!');
                }
            });
        }
    });
}

/**
 * Add structured data
 * Dynamically adds different structured data based on page type
 */
function addStructuredData() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop();
    
    // Add VideoGame structured data for game pages
    if (pageName !== 'index.html' && pageName !== '' && !pageName.includes('category')) {
        let gameTitle = document.title;
        if (gameTitle.includes(' - ')) {
            gameTitle = gameTitle.split(' - ')[0];
        }
        
        const gameGenre = getGameGenre(pageName);
        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'VideoGame',
            'name': gameTitle,
            'genre': gameGenre,
            'gamePlatform': 'Web Browser',
            'applicationCategory': 'Game',
            'offers': {
                '@type': 'Offer',
                'price': '0',
                'priceCurrency': 'USD',
                'availability': 'https://schema.org/InStock'
            }
        };
        
        // Add JSON-LD
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }
}

/**
 * Get game genre based on filename
 */
function getGameGenre(filename) {
    if (filename.includes('snake')) {
        return 'Arcade';
    } else if (filename.includes('air') || filename.includes('flight')) {
        return 'Simulation';
    } else if (filename.includes('adventure')) {
        return 'Adventure';
    } else if (filename.includes('stickman') || filename.includes('gta')) {
        return 'Action';
    } else if (filename.includes('minesweeper') || filename.includes('saolei')) {
        return 'Puzzle';
    } else if (filename.includes('monster') || filename.includes('survivors')) {
        return 'Survival';
    }
    return 'Casual';
} 