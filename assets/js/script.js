/* ============================================
   NovaCore - Main JavaScript
   ============================================ */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        initHeader();
        initMobileMenu();
        initSearchOverlay();
        initProductsDropdown();
        initSidebarDropdown();
        initCartBadge();
        initNewsletterForm();
        initBackToTop();
        initSmoothScroll();
        initFeaturedProducts();
    });

    // ============================================
    // Header Scroll Effect
    // ============================================
    function initHeader() {
        const header = document.getElementById('header');
        if (!header) return;
        
        let ticking = false;
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    if (window.scrollY > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ============================================
    // Mobile Menu - Opens from RIGHT with Blur
    // ============================================
    function initMobileMenu() {
        const menuBtn = document.getElementById('mobile-menu-btn');
        const closeBtn = document.getElementById('sidebar-close-btn');
        const sidebar = document.getElementById('mobile-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const panel = document.getElementById('sidebar-panel');
        
        if (!menuBtn || !sidebar) return;
        
        let isOpen = false;
        
        function openMenu() {
            isOpen = true;
            
            // Move sidebar into view
            sidebar.style.transform = 'translateX(0)';
            sidebar.classList.add('active');
            
            // Show overlay
            if (overlay) {
                overlay.style.opacity = '1';
            }
            
            // Slide panel in
            if (panel) {
                panel.style.transform = 'translateX(0)';
            }
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Update aria
            menuBtn.setAttribute('aria-expanded', 'true');
        }
        
        function closeMenu() {
            isOpen = false;
            
            // Move sidebar out of view
            sidebar.style.transform = 'translateX(100%)';
            sidebar.classList.remove('active');
            
            // Hide overlay
            if (overlay) {
                overlay.style.opacity = '0';
            }
            
            // Slide panel out
            if (panel) {
                panel.style.transform = 'translateX(20px)';
            }
            
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Update aria
            menuBtn.setAttribute('aria-expanded', 'false');
        }
        
        function toggleMenu() {
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        }
        
        // Toggle button
        menuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleMenu();
        });
        
        // Close button inside sidebar
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                closeMenu();
            });
        }
        
        // Click overlay to close
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                closeMenu();
            });
        }
        
        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) {
                closeMenu();
                menuBtn.focus();
            }
        });
        
        // Close on window resize to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 1024 && isOpen) {
                closeMenu();
            }
        });
        
        // Close when clicking a sidebar link (mobile nav)
        const sidebarLinks = sidebar.querySelectorAll('a');
        sidebarLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                // Small delay to allow link navigation
                setTimeout(function() {
                    if (isOpen) closeMenu();
                }, 150);
            });
        });
    }

    // ============================================
    // Search Overlay
    // ============================================
    function initSearchOverlay() {
        const searchBtns = document.querySelectorAll('#search-btn, #search-btn-mobile');
        const searchOverlay = document.getElementById('search-overlay');
        const closeBtn = document.getElementById('close-search');
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        
        if (!searchOverlay) return;
        
        let isOpen = false;
        
        function openSearch() {
            isOpen = true;
            searchOverlay.classList.add('show');
            searchOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            // Focus input after animation
            setTimeout(function() {
                if (searchInput) searchInput.focus();
            }, 100);
        }
        
        function closeSearch() {
            isOpen = false;
            searchOverlay.classList.remove('show');
            searchOverlay.classList.add('hidden');
            document.body.style.overflow = '';
            
            // Clear input and results
            if (searchInput) searchInput.value = '';
            if (searchResults) {
                searchResults.innerHTML = '<p class="text-gray-400">Start typing to search...</p>';
            }
        }
        
        // Open buttons
        searchBtns.forEach(function(btn) {
            if (btn) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    openSearch();
                });
            }
        });
        
        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', closeSearch);
        }
        
        // Close on Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) {
                closeSearch();
            }
        });
        
        // Click outside to close
        searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) {
                closeSearch();
            }
        });
        
        // Search input handler
        if (searchInput && searchResults) {
            let debounceTimer;
            
            searchInput.addEventListener('input', function() {
                clearTimeout(debounceTimer);
                
                const query = searchInput.value.trim();
                
                if (query.length < 2) {
                    searchResults.innerHTML = '<p class="text-gray-400">Start typing to search...</p>';
                    return;
                }
                
                searchResults.innerHTML = '<p class="text-gray-400">Searching...</p>';
                
                debounceTimer = setTimeout(function() {
                    performSearch(query, searchResults);
                }, 300);
            });
        }
    }
    
    function performSearch(query, resultsContainer) {
        // Try to fetch products
        fetch('assets/data/products.json')
            .then(function(response) {
                if (!response.ok) throw new Error('Failed to load');
                return response.json();
            })
            .then(function(products) {
                const q = query.toLowerCase();
                const filtered = products.filter(function(product) {
                    return product.name.toLowerCase().includes(q) ||
                           product.category.toLowerCase().includes(q) ||
                           (product.description && product.description.toLowerCase().includes(q));
                });
                displaySearchResults(filtered, resultsContainer, query);
            })
            .catch(function() {
                // Fallback to local search items
                const fallbackResults = getFallbackSearchResults(query);
                displaySearchResults(fallbackResults, resultsContainer, query);
            });
    }
    
    function getFallbackSearchResults(query) {
        const allItems = [
            { name: 'AeroSip Smart Bottle', category: 'Smart Hydration', url: 'categories/aerosip.html' },
            { name: 'EchoLock Door Security', category: 'Smart Security', url: 'categories/echolock.html' },
            { name: 'BlinkBand Fitness Tracker', category: 'Smart Wearables', url: 'categories/blinkband.html' },
            { name: 'MistHalo Personal Climate', category: 'Personal Climate', url: 'categories/misthalo.html' },
            { name: 'FlexBottle Travel Tech', category: 'Travel Tech', url: 'categories/flexbottle.html' }
        ];
        
        const q = query.toLowerCase();
        return allItems.filter(function(item) {
            return item.name.toLowerCase().includes(q) ||
                   item.category.toLowerCase().includes(q);
        });
    }
    
    function displaySearchResults(results, container, query) {
        if (!results || results.length === 0) {
            container.innerHTML = '<p class="text-gray-400">No results found for "' + escapeHTML(query) + '"</p>';
            return;
        }
        
        var html = '<div class="space-y-2">';
        
        results.forEach(function(item) {
            html += '<a href="' + item.url + '" class="search-result-item">';
            html += '<div class="font-medium">' + escapeHTML(item.name) + '</div>';
            html += '<div class="text-sm text-gray-400">' + escapeHTML(item.category) + '</div>';
            html += '</a>';
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    function escapeHTML(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ============================================
    // Products Dropdown (Desktop)
    // ============================================
    function initProductsDropdown() {
        var dropdown = document.getElementById('desktop-products-dropdown');
        var productsGroup = document.querySelector('.products-group');
        
        if (!dropdown || !productsGroup) return;
        
        var dropdownBtn = productsGroup.querySelector('button');
        var isDropdownOpen = false;
        
        if (dropdownBtn) {
            dropdownBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (isDropdownOpen) {
                    closeDropdown();
                } else {
                    openDropdown();
                }
            });
        }
        
        function openDropdown() {
            isDropdownOpen = true;
            dropdown.style.opacity = '1';
            dropdown.style.visibility = 'visible';
            dropdown.style.transform = 'translateY(0)';
        }
        
        function closeDropdown() {
            isDropdownOpen = false;
            dropdown.style.opacity = '0';
            dropdown.style.visibility = 'hidden';
            dropdown.style.transform = 'translateY(-8px)';
        }
        
        // Close on click outside
        document.addEventListener('click', function(e) {
            if (!productsGroup.contains(e.target)) {
                closeDropdown();
            }
        });
        
        // Close on Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isDropdownOpen) {
                closeDropdown();
                if (dropdownBtn) dropdownBtn.focus();
            }
        });
        
        // Keep open on hover (desktop)
        productsGroup.addEventListener('mouseenter', function() {
            if (window.innerWidth >= 1024) {
                openDropdown();
            }
        });
        
        productsGroup.addEventListener('mouseleave', function() {
            if (window.innerWidth >= 1024) {
                closeDropdown();
            }
        });
    }

    // ============================================
    // Sidebar Dropdown (Mobile)
    // ============================================
    function initSidebarDropdown() {
        var dropdownBtns = document.querySelectorAll('.sidebar-dropdown-btn');
        
        dropdownBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var dropdown = this.nextElementSibling;
                var plusIcon = this.querySelector('.sidebar-plus-icon');
                var minusIcon = this.querySelector('.sidebar-minus-icon');
                
                if (!dropdown) return;
                
                var isOpen = dropdown.style.maxHeight && dropdown.style.maxHeight !== '0px';
                
                // Close all other dropdowns first
                document.querySelectorAll('.sidebar-dropdown').forEach(function(d) {
                    if (d !== dropdown) {
                        d.style.maxHeight = '0';
                        var sb = d.previousElementSibling;
                        if (sb) {
                            var pi = sb.querySelector('.sidebar-plus-icon');
                            var mi = sb.querySelector('.sidebar-minus-icon');
                            if (pi) pi.style.display = 'block';
                            if (mi) mi.style.display = 'none';
                            sb.classList.remove('active');
                        }
                    }
                });
                
                if (isOpen) {
                    // Close this dropdown
                    dropdown.style.maxHeight = '0';
                    if (plusIcon) plusIcon.style.display = 'block';
                    if (minusIcon) minusIcon.style.display = 'none';
                    this.classList.remove('active');
                } else {
                    // Open this dropdown
                    dropdown.style.maxHeight = dropdown.scrollHeight + 'px';
                    if (plusIcon) plusIcon.style.display = 'none';
                    if (minusIcon) minusIcon.style.display = 'block';
                    this.classList.add('active');
                }
            });
        });
    }

    // ============================================
    // Cart Badge
    // ============================================
    function initCartBadge() {
        updateCartBadge();
        
        // Listen for cart updates
        document.addEventListener('cartUpdated', updateCartBadge);
        
        // Listen for cross-tab storage changes
        window.addEventListener('storage', function(e) {
            if (e.key === 'novacore_cart') {
                updateCartBadge();
            }
        });
    }
    
    function updateCartBadge() {
        var cart = getCart();
        var totalItems = cart.reduce(function(sum, item) {
            return sum + (item.quantity || 1);
        }, 0);
        
        var badges = document.querySelectorAll('#cart-badge, #cart-badge-mobile');
        
        badges.forEach(function(badge) {
            if (!badge) return;
            
            if (totalItems > 0) {
                badge.textContent = totalItems > 99 ? '99+' : totalItems;
                badge.classList.remove('hidden');
                
                // Bounce animation
                badge.classList.add('bounce');
                setTimeout(function() {
                    badge.classList.remove('bounce');
                }, 500);
            } else {
                badge.classList.add('hidden');
                badge.textContent = '0';
            }
        });
    }
    
    function getCart() {
        try {
            var cartData = localStorage.getItem('novacore_cart');
            return cartData ? JSON.parse(cartData) : [];
        } catch (e) {
            return [];
        }
    }

    // ============================================
    // Newsletter Form
    // ============================================
    function initNewsletterForm() {
        var form = document.getElementById('newsletter-form');
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var emailInput = form.querySelector('input[type="email"]');
            var submitBtn = form.querySelector('button[type="submit"]');
            
            if (!emailInput || !submitBtn) return;
            
            var email = emailInput.value.trim();
            
            // Validate email
            if (!isValidEmail(email)) {
                showFormMessage(form, 'Please enter a valid email address.', 'error');
                return;
            }
            
            // Disable form during submission
            emailInput.disabled = true;
            submitBtn.disabled = true;
            var originalText = submitBtn.textContent;
            submitBtn.textContent = 'Subscribing...';
            
            // Simulate API call
            setTimeout(function() {
                showFormMessage(form, 'Thank you for subscribing!', 'success');
                emailInput.value = '';
                emailInput.disabled = false;
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                
                // Store subscriber
                try {
                    var subscribers = JSON.parse(localStorage.getItem('novacore_subscribers') || '[]');
                    subscribers.push({
                        email: email,
                        date: new Date().toISOString()
                    });
                    localStorage.setItem('novacore_subscribers', JSON.stringify(subscribers));
                } catch (err) {
                    // Silently fail
                }
            }, 1000);
        });
    }
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function showFormMessage(form, message, type) {
        // Remove existing messages
        var existingMsg = form.querySelector('.form-message');
        if (existingMsg) existingMsg.remove();
        
        var msgDiv = document.createElement('div');
        msgDiv.className = 'form-message ' + type + ' mt-4 text-center';
        msgDiv.textContent = message;
        
        form.appendChild(msgDiv);
        
        // Auto remove after 5 seconds
        setTimeout(function() {
            msgDiv.style.opacity = '0';
            msgDiv.style.transition = 'opacity 0.3s ease';
            setTimeout(function() {
                if (msgDiv.parentNode) {
                    msgDiv.parentNode.removeChild(msgDiv);
                }
            }, 300);
        }, 5000);
    }

    // ============================================
    // Back to Top Button
    // ============================================
    function initBackToTop() {
        var btn = document.getElementById('back-to-top');
        
        // Create button if it doesn't exist
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'back-to-top';
            btn.setAttribute('aria-label', 'Back to top');
            btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>';
            document.body.appendChild(btn);
        }
        
        var ticking = false;
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    if (window.scrollY > 500) {
                        btn.classList.add('visible');
                    } else {
                        btn.classList.remove('visible');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        btn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    function initSmoothScroll() {
        document.addEventListener('click', function(e) {
            var link = e.target.closest('a[href^="#"]');
            
            if (link && link.getAttribute('href') !== '#') {
                e.preventDefault();
                
                var targetId = link.getAttribute('href').substring(1);
                var target = document.getElementById(targetId);
                
                if (target) {
                    var headerHeight = 80;
                    var header = document.getElementById('header');
                    if (header) {
                        headerHeight = header.offsetHeight;
                    }
                    
                    var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }

    // ============================================
    // Featured Products Loader
    // ============================================
    function initFeaturedProducts() {
        var container = document.getElementById('featured-products-container');
        if (!container) return;
        
        fetch('assets/data/products.json')
            .then(function(response) {
                if (!response.ok) throw new Error('Failed to load products');
                return response.json();
            })
            .then(function(products) {
                if (products && products.length > 0) {
                    renderProductCards(products.slice(0, 6), container);
                } else {
                    showEmptyProducts(container);
                }
            })
            .catch(function(error) {
                console.error('Featured products error:', error);
                showEmptyProducts(container);
            });
    }
    
    function renderProductCards(products, container) {
        var html = '';
        
        products.forEach(function(product) {
            html += '<div class="product-card group">';
            html += '<div class="relative overflow-hidden">';
            
            // Product image or placeholder
            if (product.image) {
                html += '<img src="' + escapeHTML(product.image) + '" alt="' + escapeHTML(product.name) + '" class="product-image w-full h-64 object-cover" loading="lazy">';
            } else {
                html += '<div class="w-full h-64 bg-gray-100 flex items-center justify-center">';
                html += '<svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>';
                html += '</div>';
            }
            
            // Badge
            if (product.badge) {
                html += '<span class="product-badge">' + escapeHTML(product.badge) + '</span>';
            }
            
            html += '</div>';
            
            // Product info
            html += '<div class="p-5">';
            html += '<p class="text-sm text-novacore-600 font-medium mb-1">' + escapeHTML(product.category || 'Product') + '</p>';
            html += '<h3 class="text-lg font-bold text-gray-900 mb-2">' + escapeHTML(product.name) + '</h3>';
            
            if (product.description) {
                html += '<p class="text-gray-600 text-sm mb-4 line-clamp-2">' + escapeHTML(product.description) + '</p>';
            }
            
            html += '<div class="flex items-center justify-between">';
            html += '<span class="text-xl font-bold text-gray-900">$' + (product.price || '0.00') + '</span>';
            html += '<a href="' + (product.url || '#') + '" class="text-novacore-600 hover:text-novacore-700 font-medium text-sm">View Details →</a>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        });
        
        container.innerHTML = html;
    }
    
    function showEmptyProducts(container) {
        container.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-gray-400">Products coming soon.</p></div>';
    }

    // ============================================
    // Global Utility: Toast Notification
    // ============================================
    window.showToast = function(message, type) {
        type = type || 'info';
        
        var toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.innerHTML = '<span>' + message + '</span><button class="toast-close" aria-label="Close">&times;</button>';
        
        document.body.appendChild(toast);
        
        // Close button
        var closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                removeToast(toast);
            });
        }
        
        // Auto remove after 4 seconds
        setTimeout(function() {
            removeToast(toast);
        }, 4000);
    };
    
    function removeToast(toast) {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(function() {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // ============================================
    // Global Utility: Add to Cart
    // ============================================
    window.addToCart = function(productId, name, price, quantity) {
        quantity = quantity || 1;
        
        try {
            var cart = JSON.parse(localStorage.getItem('novacore_cart') || '[]');
            
            var existingIndex = cart.findIndex(function(item) {
                return item.id === productId;
            });
            
            if (existingIndex > -1) {
                cart[existingIndex].quantity += quantity;
            } else {
                cart.push({
                    id: productId,
                    name: name,
                    price: price,
                    quantity: quantity,
                    addedAt: new Date().toISOString()
                });
            }
            
            localStorage.setItem('novacore_cart', JSON.stringify(cart));
            
            // Trigger cart update
            document.dispatchEvent(new CustomEvent('cartUpdated'));
            
            // Show success toast
            window.showToast(name + ' added to cart!', 'success');
            
        } catch (e) {
            console.error('Cart error:', e);
            window.showToast('Failed to add item to cart.', 'error');
        }
    };

    // ============================================
    // Global Utility: Debounce
    // ============================================
    window.debounce = function(func, wait) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    };

    // ============================================
    // Page Load Complete
    // ============================================
    window.addEventListener('load', function() {
        // Hide loading screen if exists
        var loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.3s ease';
            setTimeout(function() {
                loader.style.display = 'none';
            }, 300);
        }
    });

})();