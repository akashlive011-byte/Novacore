/* ============================================
   NovaCore - Search Page Script
   Fetches products from API and filters by query
   ============================================ */

(function() {
    'use strict';

    // DOM references
    var searchInput, searchCount, searchInitial, searchLoading;
    var searchNoResults, noResultsQuery, searchResultsGrid;
    var debounceTimer;

    // Run on page load
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize DOM references
        searchInput = document.getElementById('search-page-input');
        searchCount = document.getElementById('search-count');
        searchInitial = document.getElementById('search-initial');
        searchLoading = document.getElementById('search-loading');
        searchNoResults = document.getElementById('search-no-results');
        noResultsQuery = document.getElementById('no-results-query');
        searchResultsGrid = document.getElementById('search-results-grid');

        // Initialize header functionality
        initMobileMenu();
        initSidebarDropdown();
        initProductsDropdown();
        updateCartBadge();

        // Set up search input listener with debounce
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                clearTimeout(debounceTimer);
                var query = this.value.trim();
                
                if (query.length === 0) {
                    // Show initial state when input is empty
                    showInitialState();
                    return;
                }

                if (query.length < 2) {
                    // Show initial state for very short queries
                    showInitialState();
                    searchCount.textContent = 'Type at least 2 characters to search.';
                    return;
                }

                // Debounce search for 300ms
                debounceTimer = setTimeout(function() {
                    performSearch(query);
                }, 300);
            });

            // Handle Enter key
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    clearTimeout(debounceTimer);
                    var query = this.value.trim();
                    if (query.length >= 2) {
                        performSearch(query);
                    }
                }
            });
        }
    });

    // ============================================
    // SHOW INITIAL STATE
    // ============================================
    function showInitialState() {
        if (searchInitial) searchInitial.classList.remove('hidden');
        if (searchLoading) searchLoading.classList.add('hidden');
        if (searchNoResults) searchNoResults.classList.add('hidden');
        if (searchResultsGrid) {
            searchResultsGrid.classList.add('hidden');
            searchResultsGrid.innerHTML = '';
        }
        if (searchCount) searchCount.textContent = 'Start typing to search across all products.';
    }

    // ============================================
    // SHOW LOADING STATE
    // ============================================
    function showLoadingState() {
        if (searchInitial) searchInitial.classList.add('hidden');
        if (searchLoading) searchLoading.classList.remove('hidden');
        if (searchNoResults) searchNoResults.classList.add('hidden');
        if (searchResultsGrid) {
            searchResultsGrid.classList.add('hidden');
            searchResultsGrid.innerHTML = '';
        }
    }

    // ============================================
    // SHOW NO RESULTS STATE
    // ============================================
    function showNoResults(query) {
        if (searchInitial) searchInitial.classList.add('hidden');
        if (searchLoading) searchLoading.classList.add('hidden');
        if (searchNoResults) searchNoResults.classList.remove('hidden');
        if (noResultsQuery) noResultsQuery.textContent = 'No results found for "' + query + '".';
        if (searchResultsGrid) {
            searchResultsGrid.classList.add('hidden');
            searchResultsGrid.innerHTML = '';
        }
        if (searchCount) searchCount.textContent = '0 results found.';
    }

    // ============================================
    // PERFORM SEARCH
    // ============================================
    function performSearch(query) {
        showLoadingState();

        if (!window.NovaCoreAPI) {
            // API not available - show error
            if (searchLoading) searchLoading.classList.add('hidden');
            if (searchCount) searchCount.textContent = 'Search is currently unavailable.';
            return;
        }

        // Use the API search function
        window.NovaCoreAPI.searchProducts(query)
            .then(function(results) {
                if (!results || results.length === 0) {
                    showNoResults(query);
                    return;
                }

                // Show results
                renderResults(results, query);
            })
            .catch(function(error) {
                console.error('Search error:', error);
                if (searchLoading) searchLoading.classList.add('hidden');
                if (searchCount) searchCount.textContent = 'An error occurred. Please try again.';
            });
    }

    // ============================================
    // RENDER SEARCH RESULTS
    // ============================================
    function renderResults(products, query) {
        // Hide other states
        if (searchInitial) searchInitial.classList.add('hidden');
        if (searchLoading) searchLoading.classList.add('hidden');
        if (searchNoResults) searchNoResults.classList.add('hidden');

        // Update count
        if (searchCount) {
            searchCount.textContent = products.length + ' result' + (products.length !== 1 ? 's' : '') + ' found for "' + query + '".';
        }

        // Build results HTML
        var html = '';
        products.forEach(function(product) {
            html += '<a href="../' + product.url + '" class="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md hover:border-novacore-100 transition-all group">';
            
            // Product image
            html += '<div class="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">';
            if (product.image) {
                html += '<img src="../' + product.image + '" alt="' + product.name + '" class="w-full h-full object-cover" loading="lazy" onerror="this.onerror=null;this.style.display=\'none\';">';
            }
            html += '</div>';
            
            // Product info
            html += '<div class="flex-1 min-w-0">';
            html += '<h3 class="font-semibold text-gray-900 group-hover:text-novacore-600 transition-colors truncate">' + product.name + '</h3>';
            html += '<p class="text-sm text-novacore-600">' + product.category + '</p>';
            if (product.description) {
                html += '<p class="text-sm text-gray-500 truncate mt-0.5">' + product.description + '</p>';
            }
            html += '</div>';
            
            // Price and badge
            html += '<div class="text-right flex-shrink-0">';
            html += '<span class="font-bold text-gray-900">$' + product.price + '</span>';
            if (product.badge) {
                html += '<span class="block text-xs bg-novacore-100 text-novacore-700 px-2 py-0.5 rounded-full mt-1">' + product.badge + '</span>';
            }
            html += '</div>';
            
            html += '</a>';
        });

        // Insert into grid
        if (searchResultsGrid) {
            searchResultsGrid.innerHTML = html;
            searchResultsGrid.classList.remove('hidden');
        }
    }

    // ============================================
    // MOBILE MENU
    // ============================================
    function initMobileMenu() {
        var menuBtn = document.getElementById('mobile-menu-btn');
        var sidebar = document.getElementById('mobile-sidebar');
        var overlay = document.getElementById('sidebar-overlay');
        var panel = document.getElementById('sidebar-panel');
        if (!menuBtn || !sidebar) return;
        var isOpen = false;
        
        menuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            isOpen = !isOpen;
            if (isOpen) {
                sidebar.style.transform = 'translateX(0)';
                if (overlay) overlay.style.opacity = '1';
                if (panel) panel.style.transform = 'translateX(0)';
                document.body.style.overflow = 'hidden';
            } else {
                sidebar.style.transform = 'translateX(100%)';
                if (overlay) overlay.style.opacity = '0';
                if (panel) panel.style.transform = 'translateX(20px)';
                document.body.style.overflow = '';
            }
        });
        
        if (overlay) overlay.addEventListener('click', function() {
            isOpen = false;
            sidebar.style.transform = 'translateX(100%)';
            overlay.style.opacity = '0';
            if (panel) panel.style.transform = 'translateX(20px)';
            document.body.style.overflow = '';
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) {
                isOpen = false;
                sidebar.style.transform = 'translateX(100%)';
                if (overlay) overlay.style.opacity = '0';
                if (panel) panel.style.transform = 'translateX(20px)';
                document.body.style.overflow = '';
            }
        });
    }

    // ============================================
    // SIDEBAR DROPDOWN
    // ============================================
    function initSidebarDropdown() {
        document.querySelectorAll('.sidebar-dropdown-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var dropdown = this.nextElementSibling;
                var plusIcon = this.querySelector('.sidebar-plus-icon');
                var minusIcon = this.querySelector('.sidebar-minus-icon');
                if (!dropdown) return;
                var isOpen = dropdown.style.maxHeight && dropdown.style.maxHeight !== '0px';
                
                document.querySelectorAll('.sidebar-dropdown').forEach(function(d) {
                    if (d !== dropdown) {
                        d.style.maxHeight = '0';
                        var sb = d.previousElementSibling;
                        if (sb) {
                            var pi = sb.querySelector('.sidebar-plus-icon');
                            var mi = sb.querySelector('.sidebar-minus-icon');
                            if (pi) pi.style.display = 'block';
                            if (mi) mi.style.display = 'none';
                        }
                    }
                });
                
                if (isOpen) {
                    dropdown.style.maxHeight = '0';
                    if (plusIcon) plusIcon.style.display = 'block';
                    if (minusIcon) minusIcon.style.display = 'none';
                } else {
                    dropdown.style.maxHeight = dropdown.scrollHeight + 'px';
                    if (plusIcon) plusIcon.style.display = 'none';
                    if (minusIcon) minusIcon.style.display = 'block';
                }
            });
        });
    }

    // ============================================
    // PRODUCTS DROPDOWN
    // ============================================
    function initProductsDropdown() {
        var dropdown = document.getElementById('desktop-products-dropdown');
        var group = document.querySelector('.products-group');
        if (!dropdown || !group) return;
        var isOpen = false;
        var btn = group.querySelector('button');
        
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                isOpen = !isOpen;
                dropdown.style.opacity = isOpen ? '1' : '0';
                dropdown.style.visibility = isOpen ? 'visible' : 'hidden';
            });
        }
        
        document.addEventListener('click', function(e) {
            if (!group.contains(e.target)) {
                isOpen = false;
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
            }
        });
        
        group.addEventListener('mouseenter', function() {
            if (window.innerWidth >= 1024) {
                isOpen = true;
                dropdown.style.opacity = '1';
                dropdown.style.visibility = 'visible';
            }
        });
        group.addEventListener('mouseleave', function() {
            if (window.innerWidth >= 1024) {
                isOpen = false;
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
            }
        });
    }

    // ============================================
    // UPDATE CART BADGE
    // ============================================
    function updateCartBadge() {
        if (!window.NovaCoreAPI) return;
        var count = window.NovaCoreAPI.getCartCount();
        document.querySelectorAll('#cart-badge, #cart-badge-mobile').forEach(function(badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        });
    }

    // Listen for cart updates from other pages
    document.addEventListener('cartUpdated', updateCartBadge);

})();