/* ============================================
   NovaCore - Product Details Page Script
   Loads a single product by ID from URL parameter
   Displays full product info with add to cart
   ============================================ */

(function() {
    'use strict';

    var product = null; // Store loaded product data

    // ============================================
    // PAGE INITIALIZATION
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        
        // Get the product ID from URL query string (?id=...)
        var productId = getProductIdFromURL();
        
        // If no ID provided, show error
        if (!productId) {
            showError('No product specified. Please select a product from our catalog.');
            return;
        }

        // Initialize header functionality
        initMobileMenu();        // Mobile sidebar toggle
        initSidebarDropdown();   // Products accordion in sidebar
        initProductsDropdown();  // Desktop products dropdown
        
        // Load the product data
        loadProduct(productId);
        
        // Update cart badge
        updateCartBadge();
    });

    // ============================================
    // GET PRODUCT ID FROM URL
    // Reads the "id" parameter from the query string
    // Example: products-details.html?id=aerosip-smart-bottle
    // ============================================
    function getProductIdFromURL() {
        var params = new URLSearchParams(window.location.search);
        return params.get('id'); // Returns null if no id parameter
    }

    // ============================================
    // LOAD PRODUCT DATA
    // Fetches single product from API by ID
    // ============================================
    function loadProduct(productId) {
        
        // Check if API is available
        if (!window.NovaCoreAPI) {
            showError('Unable to load product data. Please try again later.');
            return;
        }

        // Fetch product by ID from the API
        window.NovaCoreAPI.getProductById(productId)
            .then(function(data) {
                
                // If product not found in database
                if (!data) {
                    showError('Product not found. It may have been removed or the link is incorrect.');
                    return;
                }
                
                // Store product data globally
                product = data;
                
                // Render the product details
                renderProduct(data);
                
                // Update browser tab title
                document.title = data.name + ' - NovaCore';
                
                // Update meta description for SEO
                var metaDescription = document.querySelector('meta[name="description"]');
                if (metaDescription && data.description) {
                    metaDescription.setAttribute('content', data.description);
                }
                
            })
            .catch(function(error) {
                console.error('Failed to load product:', error);
                showError('Failed to load product details. Please try again later.');
            });
    }

    // ============================================
    // RENDER PRODUCT DETAILS
    // Builds the complete product detail page HTML
    // ============================================
    function renderProduct(data) {
        var container = document.getElementById('product-container');
        if (!container) return;

        // ============================================
        // STOCK STATUS BADGE
        // ============================================
        var stockStatus = data.inStock 
            ? '<span class="inline-flex items-center text-green-600 text-sm font-medium"><span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>In Stock</span>'
            : '<span class="inline-flex items-center text-red-600 text-sm font-medium"><span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>Out of Stock</span>';

        // ============================================
        // FEATURES LIST
        // Builds checkmark list from product features array
        // ============================================
        var featuresHTML = '';
        if (data.features && data.features.length > 0) {
            featuresHTML = '<ul class="space-y-2">';
            data.features.forEach(function(feature) {
                featuresHTML += '<li class="flex items-center text-gray-600">';
                featuresHTML += '<svg class="w-4 h-4 text-novacore-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
                featuresHTML += escapeHTML(feature);
                featuresHTML += '</li>';
            });
            featuresHTML += '</ul>';
        }

        // ============================================
        // RATING STARS
        // Shows star rating with review count
        // ============================================
        var ratingHTML = '';
        if (data.rating) {
            ratingHTML = '<div class="flex items-center">';
            ratingHTML += '<span class="text-yellow-400 text-lg">&#9733;</span>'; // Filled star
            ratingHTML += '<span class="text-gray-700 font-medium ml-1">' + data.rating + '</span>';
            ratingHTML += '<span class="text-gray-400 ml-1">(' + data.reviews + ' reviews)</span>';
            ratingHTML += '</div>';
        }

        // ============================================
        // BUILD COMPLETE HTML
        // ============================================
        var html = '';
        
        // Main section wrapper
        html += '<section class="py-16 bg-white"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">';
        
        // ============================================
        // BREADCRUMB NAVIGATION
        // Home > Category > Product Name
        // ============================================
        html += '<nav class="mb-8">';
        html += '<ol class="flex items-center space-x-2 text-sm text-gray-500">';
        html += '<li><a href="../index.html" class="hover:text-novacore-600 transition-colors">Home</a></li>';
        html += '<li><span class="mx-2">/</span></li>';
        html += '<li><a href="../categories/' + data.category.toLowerCase().replace(/\s+/g, '-') + '.html" class="hover:text-novacore-600 transition-colors">' + escapeHTML(data.category) + '</a></li>';
        html += '<li><span class="mx-2">/</span></li>';
        html += '<li class="text-gray-900">' + escapeHTML(data.name) + '</li>';
        html += '</ol></nav>';

        // ============================================
        // PRODUCT LAYOUT (2 columns on desktop)
        // Left: Image | Right: Info + Add to Cart
        // ============================================
        html += '<div class="grid grid-cols-1 lg:grid-cols-2 gap-12">';
        
        // ============================================
        // LEFT COLUMN - PRODUCT IMAGE
        // ============================================
        html += '<div class="relative">';
        
        // Product image with fallback
        if (data.image) {
            html += '<img src="../' + data.image + '" alt="' + escapeHTML(data.name) + '" class="w-full rounded-2xl object-cover" onerror="this.onerror=null;this.src=\'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22600%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22600%22 height=%22600%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%239ca3af%22 font-size=%2220%22%3ENo Image%3C/text%3E%3C/svg%3E\';">';
        } else {
            // No image available - show placeholder
            html += '<div class="w-full aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">';
            html += '<svg class="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>';
            html += '</div>';
        }
        
        // Product badge (Best Seller, New, Popular, etc.)
        if (data.badge) {
            html += '<span class="absolute top-4 left-4 bg-novacore-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full">' + escapeHTML(data.badge) + '</span>';
        }
        
        html += '</div>'; // End left column
        
        // ============================================
        // RIGHT COLUMN - PRODUCT INFO
        // ============================================
        html += '<div>';
        
        // Category label
        html += '<p class="text-novacore-600 font-medium mb-2">' + escapeHTML(data.category) + '</p>';
        
        // Product name (H1 heading)
        html += '<h1 class="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">' + escapeHTML(data.name) + '</h1>';
        
        // Star rating (if available)
        if (ratingHTML) {
            html += '<div class="mb-4">' + ratingHTML + '</div>';
        }
        
        // Price (large, bold)
        html += '<p class="text-4xl font-bold text-gray-900 mb-6">$' + data.price + '</p>';
        
        // Product description
        html += '<p class="text-gray-600 mb-6 leading-relaxed">' + escapeHTML(data.description || '') + '</p>';
        
        // Stock status indicator
        html += '<div class="mb-6">' + stockStatus + '</div>';
        
        // Key Features list
        if (featuresHTML) {
            html += '<div class="mb-8">';
            html += '<h3 class="text-lg font-bold text-gray-900 mb-3">Key Features</h3>';
            html += featuresHTML;
            html += '</div>';
        }
        
        // ============================================
        // ADD TO CART SECTION
        // Quantity selector + Add to Cart button
        // ============================================
        html += '<div class="flex items-center gap-4">';
        
        // Quantity selector (- / number / +)
        html += '<div class="flex items-center border border-gray-200 rounded-full">';
        html += '<button class="qty-btn w-10 h-10 flex items-center justify-center text-gray-600 hover:text-novacore-600 transition-colors text-lg" data-action="decrease" aria-label="Decrease quantity">−</button>';
        html += '<input type="number" id="quantity-input" class="w-14 h-10 text-center border-x border-gray-200 focus:outline-none text-gray-900 font-medium" value="1" min="1" max="99" aria-label="Quantity">';
        html += '<button class="qty-btn w-10 h-10 flex items-center justify-center text-gray-600 hover:text-novacore-600 transition-colors text-lg" data-action="increase" aria-label="Increase quantity">+</button>';
        html += '</div>';
        
        // Add to Cart button (or Out of Stock message)
        if (data.inStock) {
            html += '<button id="add-to-cart-btn" class="flex-1 bg-novacore-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-novacore-700 transition-colors" data-id="' + data.id + '">Add to Cart</button>';
        } else {
            html += '<button class="flex-1 bg-gray-300 text-gray-500 font-semibold px-8 py-3 rounded-full cursor-not-allowed" disabled>Out of Stock</button>';
        }
        
        html += '</div>'; // End add to cart section
        
        html += '</div>'; // End right column
        
        html += '</div>'; // End product layout grid
        html += '</div></section>'; // End section
        
        // Insert into page
        container.innerHTML = html;
        
        // Initialize interactive elements
        initQuantityButtons();  // +/- quantity controls
        initAddToCart();        // Add to cart button handler
    }

    // ============================================
    // QUANTITY BUTTONS
    // Handles the +/- buttons for quantity
    // Also validates manual input
    // ============================================
    function initQuantityButtons() {
        var qtyInput = document.getElementById('quantity-input');
        var qtyBtns = document.querySelectorAll('.qty-btn');
        
        if (!qtyInput) return;
        
        // Handle +/- button clicks
        qtyBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var action = this.getAttribute('data-action');
                var currentValue = parseInt(qtyInput.value) || 1;
                
                if (action === 'increase') {
                    // Increase quantity (max 99)
                    qtyInput.value = Math.min(currentValue + 1, 99);
                } else if (action === 'decrease') {
                    // Decrease quantity (min 1)
                    qtyInput.value = Math.max(currentValue - 1, 1);
                }
            });
        });
        
        // Validate manual input (ensure 1-99 range)
        qtyInput.addEventListener('change', function() {
            var value = parseInt(this.value) || 1;
            this.value = Math.max(1, Math.min(value, 99));
        });
        
        // Prevent non-numeric input
        qtyInput.addEventListener('keypress', function(e) {
            if (!/[\d]/.test(e.key)) {
                e.preventDefault();
            }
        });
    }

    // ============================================
    // ADD TO CART BUTTON HANDLER
    // Adds product to cart with selected quantity
    // Shows success feedback on button
    // ============================================
    function initAddToCart() {
        var addBtn = document.getElementById('add-to-cart-btn');
        if (!addBtn) return; // Product is out of stock
        
        addBtn.addEventListener('click', function() {
            var productId = this.getAttribute('data-id');
            var qtyInput = document.getElementById('quantity-input');
            var quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
            
            // Check API availability
            if (!window.NovaCoreAPI) {
                alert('Unable to add to cart. Please try again.');
                return;
            }
            
            // Save original button text
            var originalText = this.textContent;
            
            // Show loading state
            this.textContent = 'Adding...';
            this.disabled = true;
            this.style.opacity = '0.7';
            
            // Call API to add to cart
            window.NovaCoreAPI.addToCart(productId, quantity)
                .then(function() {
                    // Success feedback
                    addBtn.textContent = 'Added ✓';
                    addBtn.classList.add('bg-green-600');
                    addBtn.classList.remove('hover:bg-novacore-700');
                    addBtn.style.opacity = '1';
                    
                    // Update cart badge count
                    updateCartBadge();
                    
                    // Reset button after 2 seconds
                    setTimeout(function() {
                        addBtn.textContent = originalText;
                        addBtn.classList.remove('bg-green-600');
                        addBtn.classList.add('hover:bg-novacore-700');
                        addBtn.disabled = false;
                        addBtn.style.opacity = '1';
                    }, 2000);
                })
                .catch(function(error) {
                    console.error('Add to cart error:', error);
                    
                    // Error feedback
                    addBtn.textContent = 'Error - Try Again';
                    addBtn.style.opacity = '1';
                    
                    // Reset after 2 seconds
                    setTimeout(function() {
                        addBtn.textContent = originalText;
                        addBtn.disabled = false;
                        addBtn.style.opacity = '1';
                    }, 2000);
                });
        });
    }

    // ============================================
    // SHOW ERROR STATE
    // Displays error message with back to home link
    // ============================================
    function showError(message) {
        var container = document.getElementById('product-container');
        if (container) {
            container.innerHTML = 
                '<div class="flex justify-center items-center py-32">' +
                    '<div class="text-center max-w-md">' +
                        '<svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' +
                        '<p class="text-gray-500 text-lg mb-4">' + escapeHTML(message) + '</p>' +
                        '<a href="../index.html" class="inline-flex items-center text-novacore-600 hover:text-novacore-700 font-medium">' +
                            '<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>' +
                            'Back to Home' +
                        '</a>' +
                    '</div>' +
                '</div>';
        }
    }

    // ============================================
    // MOBILE MENU TOGGLE
    // Opens sidebar from right side
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
                sidebar.classList.add('active');
                if (overlay) overlay.style.opacity = '1';
                if (panel) panel.style.transform = 'translateX(0)';
                document.body.style.overflow = 'hidden';
            } else {
                sidebar.style.transform = 'translateX(100%)';
                sidebar.classList.remove('active');
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
    // SIDEBAR PRODUCTS DROPDOWN (Accordion)
    // ============================================
    function initSidebarDropdown() {
        document.querySelectorAll('.sidebar-dropdown-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var dropdown = this.nextElementSibling;
                var plusIcon = this.querySelector('.sidebar-plus-icon');
                var minusIcon = this.querySelector('.sidebar-minus-icon');
                if (!dropdown) return;
                
                var isOpen = dropdown.style.maxHeight && dropdown.style.maxHeight !== '0px';
                
                // Close other dropdowns
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
                
                // Toggle this dropdown
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
    // DESKTOP PRODUCTS DROPDOWN
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
    // UPDATE CART BADGE COUNT
    // Shows number of items in cart on the icon
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

    // ============================================
    // UTILITY: ESCAPE HTML
    // Prevents XSS by encoding special characters
    // ============================================
    function escapeHTML(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Listen for cart updates from other pages/tabs
    document.addEventListener('cartUpdated', updateCartBadge);

})();