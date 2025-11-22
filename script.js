// ========================================
// Mobile Navigation Toggle
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const submenuToggles = document.querySelectorAll('.submenu-toggle');
    
    // Toggle mobile menu
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Toggle aria-expanded
            this.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle nav menu
            navMenu.classList.toggle('active');
            
            // No animation - static display
        });
    }
    
    // Toggle submenus on mobile
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const submenu = this.nextElementSibling;
            const parent = this.closest('.has-submenu');
            
            if (submenu) {
                const isOpen = submenu.style.display === 'block';
                submenu.style.display = isOpen ? 'none' : 'block';
                parent.classList.toggle('open');
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileMenuToggle && navMenu) {
            const isClickInside = navMenu.contains(e.target) || 
                                 mobileMenuToggle.contains(e.target);
            
            if (!isClickInside && navMenu.classList.contains('active')) {
                mobileMenuToggle.click();
            }
        }
    });
    
    // Close mobile menu on window resize (if desktop view)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navMenu) {
            navMenu.classList.remove('active');
            if (mobileMenuToggle) {
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                // No animation reset needed
            }
        }
    });
});

// ========================================
// Smooth Scroll for Anchor Links
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for internal anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#' || href === '#!') {
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                // Calculate offset for sticky header
                const header = document.querySelector('.site-header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'auto'
                });
                
                // Close mobile menu if open
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu && navMenu.classList.contains('active')) {
                    document.querySelector('.mobile-menu-toggle')?.click();
                }
            }
        });
    });
});

// ========================================
// Search Form Enhancement with Live Results
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('#search-input');
    
    if (searchForm && searchInput) {
        // Create search results container
        const searchResults = document.createElement('div');
        searchResults.className = 'search-results';
        searchResults.id = 'search-results';
        searchForm.appendChild(searchResults);
        
        // Get all articles/posts on the page
        function getAllArticles() {
            const articles = [];
            
            // Get favorite cards
            const favoriteCards = document.querySelectorAll('.favorite-card');
            favoriteCards.forEach(card => {
                const titleEl = card.querySelector('.favorite-title a');
                const excerptEl = card.querySelector('.favorite-excerpt');
                const link = titleEl?.href;
                const title = titleEl?.textContent?.trim() || '';
                const excerpt = excerptEl?.textContent?.trim() || '';
                
                if (link && title) {
                    articles.push({
                        title: title,
                        excerpt: excerpt,
                        link: link,
                        date: null
                    });
                }
            });
            
            // Get post items
            const postItems = document.querySelectorAll('.post-item');
            postItems.forEach(item => {
                const titleEl = item.querySelector('.post-title a');
                const dateEl = item.querySelector('.post-date');
                const link = titleEl?.href;
                const title = titleEl?.textContent?.trim() || '';
                const date = dateEl?.textContent?.trim() || null;
                const datetime = dateEl?.getAttribute('datetime') || null;
                
                if (link && title) {
                    articles.push({
                        title: title,
                        excerpt: '',
                        link: link,
                        date: date,
                        datetime: datetime
                    });
                }
            });
            
            // Also check interest areas page for posts-list-mini items
            const miniPosts = document.querySelectorAll('.posts-list-mini li');
            miniPosts.forEach(item => {
                const linkEl = item.querySelector('a');
                const dateEl = item.querySelector('time');
                const link = linkEl?.href;
                const title = linkEl?.textContent?.trim() || '';
                const date = dateEl?.textContent?.trim() || null;
                const datetime = dateEl?.getAttribute('datetime') || null;
                
                if (link && title) {
                    articles.push({
                        title: title,
                        excerpt: '',
                        link: link,
                        date: date,
                        datetime: datetime
                    });
                }
            });
            
            return articles;
        }
        
        // Search function
        function performSearch(query) {
            if (!query || query.length < 2) {
                searchResults.classList.remove('active');
                return;
            }
            
            const articles = getAllArticles();
            const queryLower = query.toLowerCase();
            
            // Filter articles by title and excerpt
            const results = articles.filter(article => {
                const titleMatch = article.title.toLowerCase().includes(queryLower);
                const excerptMatch = article.excerpt.toLowerCase().includes(queryLower);
                return titleMatch || excerptMatch;
            });
            
            // Sort by relevance (title matches first, then excerpt matches)
            results.sort((a, b) => {
                const aTitleMatch = a.title.toLowerCase().includes(queryLower);
                const bTitleMatch = b.title.toLowerCase().includes(queryLower);
                if (aTitleMatch && !bTitleMatch) return -1;
                if (!aTitleMatch && bTitleMatch) return 1;
                return 0;
            });
            
            // Limit to 10 results
            const limitedResults = results.slice(0, 10);
            
            // Display results
            displayResults(limitedResults, query);
        }
        
        // Display search results
        function displayResults(results, query) {
            if (results.length === 0) {
                searchResults.innerHTML = '<div class="search-results-empty">No articles found</div>';
                searchResults.classList.add('active');
                return;
            }
            
            searchResults.innerHTML = results.map(article => {
                const excerpt = article.excerpt 
                    ? `<p class="search-result-excerpt">${article.excerpt}</p>` 
                    : '';
                const date = article.date 
                    ? `<div class="search-result-date">${article.date}</div>` 
                    : '';
                
                return `
                    <a href="${article.link}" class="search-result-item">
                        <div class="search-result-title">${highlightMatch(article.title, query)}</div>
                        ${excerpt}
                        ${date}
                    </a>
                `;
            }).join('');
            
            searchResults.classList.add('active');
        }
        
        // Highlight matching text
        function highlightMatch(text, query) {
            if (!query) return text;
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        }
        
        // Handle input
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            if (query.length < 2) {
                searchResults.classList.remove('active');
                return;
            }
            
            // Debounce search
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 150);
        });
        
        // Handle form submission
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = searchInput.value.trim();
            
            if (query && searchResults.querySelector('.search-result-item')) {
                // Go to first result
                const firstResult = searchResults.querySelector('.search-result-item');
                if (firstResult) {
                    window.location.href = firstResult.href;
                }
            }
        });
        
        // Close search results when clicking outside (with slight delay to allow clicks)
        document.addEventListener('click', function(e) {
            if (!searchForm.contains(e.target)) {
                setTimeout(() => {
                    if (!searchForm.contains(document.activeElement)) {
                        searchResults.classList.remove('active');
                    }
                }, 100);
            }
        });
        
        // Keep results open when clicking on them
        searchResults.addEventListener('click', function(e) {
            if (e.target.closest('.search-result-item')) {
                // Allow navigation to happen
                searchResults.classList.remove('active');
            }
        });
        
        // Keyboard navigation
        searchInput.addEventListener('keydown', function(e) {
            const items = searchResults.querySelectorAll('.search-result-item');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const currentIndex = Array.from(items).findIndex(item => item === document.activeElement);
                const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                if (items[nextIndex]) {
                    items[nextIndex].focus();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const currentIndex = Array.from(items).findIndex(item => item === document.activeElement);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                if (items[prevIndex]) {
                    items[prevIndex].focus();
                }
            } else if (e.key === 'Escape') {
                searchResults.classList.remove('active');
                searchInput.blur();
            }
        });
    }
});

// ========================================
// Intersection Observer for Animations - DISABLED
// ========================================

// Animations removed for instant display

// ========================================
// Keyboard Navigation Enhancement
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Improve keyboard navigation for cards
    const cards = document.querySelectorAll('.favorite-card, .post-item');
    
    cards.forEach(card => {
        const link = card.querySelector('a');
        
        if (link) {
            // Make card keyboard accessible
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'article');
            
            card.addEventListener('keydown', function(e) {
                // Enter or Space key
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
            
            // Add hover effect on keyboard focus
            card.addEventListener('focus', function() {
                this.style.outline = '2px solid var(--color-secondary)';
                this.style.outlineOffset = '2px';
            });
            
            card.addEventListener('blur', function() {
                this.style.outline = '';
                this.style.outlineOffset = '';
            });
        }
    });
});

// ========================================
// Lazy Loading Images (if needed in future)
// ========================================

// This can be expanded if images are added later
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src || img.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// ========================================
// Performance: Debounce Function
// ========================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounce scroll events if needed
const handleScroll = debounce(function() {
    // Add scroll-based functionality here if needed
}, 100);

window.addEventListener('scroll', handleScroll, { passive: true });

