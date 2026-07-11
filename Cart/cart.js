/* ============================================
   NovaCore - Cart Page Script
   ============================================ */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
        initSidebarDropdown();
        initProductsDropdown();
        initSearchOverlay();
        loadCart();
        updateCartBadge();
    });

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
            if (!group.contains(e.target)) { isOpen = false; dropdown.style.opacity = '0'; dropdown.style.visibility = 'hidden'; }
        });
        
        group.addEventListener('mouseenter', function() { if (window.innerWidth >= 1024) { isOpen = true; dropdown.style.opacity = '1'; dropdown.style.visibility = 'visible'; } });
        group.addEventListener('mouseleave', function() { if (window.innerWidth >= 1024) { isOpen = false; dropdown.style.opacity = '0'; dropdown.style.visibility = 'hidden'; } });
    }

    // ============================================
    // SEARCH OVERLAY
    // ============================================
    function initSearchOverlay() {
        var searchBtns = document.querySelectorAll('#search-btn, #search-btn-mobile');
        var overlay = document.getElementById('search-overlay');
        var closeBtn = document.getElementById('close-search');
        var input = document.getElementById('search-input');
        if (!overlay) return;
        
        searchBtns.forEach(function(btn) {
            if (btn) btn.addEventListener('click', function() {
                overlay.classList.remove('hidden');
                if (input) setTimeout(function() { input.focus(); }, 100);
                document.body.style.overflow = 'hidden';
            });
        });
        
        if (closeBtn) closeBtn.addEventListener('click', function() { overlay.classList.add('hidden'); document.body.style.overflow = ''; if (input) input.value = ''; });
        document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && !overlay.classList.contains('hidden')) { overlay.classList.add('hidden'); document.body.style.overflow = ''; if (input) input.value = ''; } });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) { overlay.classList.add('hidden'); document.body.style.overflow = ''; if (input) input.value = ''; } });
    }

    // ============================================
    // LOAD CART
    // ============================================
    function loadCart() {
        if (!window.NovaCoreAPI) return;
        
        var cart = window.NovaCoreAPI.getCart();
        renderCart(cart);
    }

    // ============================================
    // RENDER CART
    // ============================================
    function renderCart(cart) {
        var emptyCart = document.getElementById('empty-cart');
        var cartList = document.getElementById('cart-items-list');
        var cartSummary = document.getElementById('cart-summary');
        var countText = document.getElementById('cart-count-text');
        
        if (!cart || cart.length === 0) {
            // Show empty state
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartList) cartList.classList.add('hidden');
            if (cartSummary) cartSummary.classList.add('hidden');
            if (countText) countText.textContent = '0 items';
            return;
        }
        
        // Hide empty state
        if (emptyCart) emptyCart.style.display = 'none';
        if (cartList) cartList.classList.remove('hidden');
        if (cartSummary) cartSummary.classList.remove('hidden');
        
        var totalItems = cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
        if (countText) countText.textContent = totalItems + ' item' + (totalItems !== 1 ? 's' : '');
        
        // Render cart items
        var html = '';
        cart.forEach(function(item, index) {
            var itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
            
            html += '<div class="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4">';
            
            // Product image
            html += '<div class="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">';
            if (item.image) {
                html += '<img src="../' + item.image + '" alt="' + item.name + '" class="w-full h-full object-cover" onerror="this.onerror=null;this.style.display=\'none\';">';
            }
            html += '</div>';
            
            // Product info
            html += '<div class="flex-1 min-w-0">';
            html += '<h3 class="font-semibold text-gray-900 truncate">' + item.name + '</h3>';
            html += '<p class="text-sm text-gray-500">$' + item.price + ' each</p>';
            
            // Quantity controls
            html += '<div class="flex items-center gap-3 mt-2">';
            html += '<div class="flex items-center border border-gray-200 rounded-full">';
            html += '<button class="qty-dec w-8 h-8 flex items-center justify-center text-gray-500 hover:text-novacore-600 transition-colors" data-index="' + index + '">-</button>';
            html += '<span class="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-900">' + item.quantity + '</span>';
            html += '<button class="qty-inc w-8 h-8 flex items-center justify-center text-gray-500 hover:text-novacore-600 transition-colors" data-index="' + index + '">+</button>';
            html += '</div>';
            
            // Remove button
            html += '<button class="remove-item text-sm text-red-500 hover:text-red-600 transition-colors" data-index="' + index + '">Remove</button>';
            html += '</div>';
            
            html += '</div>';
            
            // Item total
            html += '<div class="text-right flex-shrink-0">';
            html += '<span class="font-bold text-gray-900">$' + itemTotal + '</span>';
            html += '</div>';
            
            html += '</div>';
        });
        
        cartList.innerHTML = html;
        
        // Update totals
        updateCartTotals(cart);
        
        // Add event listeners
        initCartActions();
    }

    // ============================================
    // UPDATE CART TOTALS
    // ============================================
    function updateCartTotals(cart) {
        if (!window.NovaCoreAPI) return;
        
        var subtotal = window.NovaCoreAPI.getCartTotal();
        var total = subtotal;
        
        var subtotalEl = document.getElementById('cart-subtotal');
        var totalEl = document.getElementById('cart-total');
        
        if (subtotalEl) subtotalEl.textContent = '$' + subtotal;
        if (totalEl) totalEl.textContent = '$' + total;
    }

    // ============================================
    // CART ACTIONS (Quantity, Remove, Clear)
    // ============================================
    function initCartActions() {
        if (!window.NovaCoreAPI) return;
        
        // Quantity decrease
        document.querySelectorAll('.qty-dec').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var index = parseInt(this.getAttribute('data-index'));
                var cart = window.NovaCoreAPI.getCart();
                if (cart[index]) {
                    var newQty = cart[index].quantity - 1;
                    if (newQty <= 0) {
                        window.NovaCoreAPI.removeFromCart(cart[index].id);
                    } else {
                        window.NovaCoreAPI.updateCartQuantity(cart[index].id, newQty);
                    }
                    renderCart(window.NovaCoreAPI.getCart());
                    updateCartBadge();
                }
            });
        });
        
        // Quantity increase
        document.querySelectorAll('.qty-inc').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var index = parseInt(this.getAttribute('data-index'));
                var cart = window.NovaCoreAPI.getCart();
                if (cart[index]) {
                    window.NovaCoreAPI.updateCartQuantity(cart[index].id, cart[index].quantity + 1);
                    renderCart(window.NovaCoreAPI.getCart());
                    updateCartBadge();
                }
            });
        });
        
        // Remove item
        document.querySelectorAll('.remove-item').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var index = parseInt(this.getAttribute('data-index'));
                var cart = window.NovaCoreAPI.getCart();
                if (cart[index]) {
                    window.NovaCoreAPI.removeFromCart(cart[index].id);
                    renderCart(window.NovaCoreAPI.getCart());
                    updateCartBadge();
                }
            });
        });
        
        // Clear cart
        var clearBtn = document.getElementById('clear-cart-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to clear your cart?')) {
                    var cart = window.NovaCoreAPI.getCart();
                    cart.forEach(function(item) {
                        window.NovaCoreAPI.removeFromCart(item.id);
                    });
                    renderCart([]);
                    updateCartBadge();
                }
            });
        }
    }

    // ============================================
    // UPDATE CART BADGE
    // ============================================
    function updateCartBadge() {
        if (!window.NovaCoreAPI) return;
        var count = window.NovaCoreAPI.getCartCount();
        document.querySelectorAll('#cart-badge, #cart-badge-mobile').forEach(function(badge) {
            if (count > 0) { badge.textContent = count > 99 ? '99+' : count; badge.classList.remove('hidden'); }
            else { badge.classList.add('hidden'); }
        });
    }

    // Listen for cart updates
    document.addEventListener('cartUpdated', function() {
        if (window.NovaCoreAPI) {
            renderCart(window.NovaCoreAPI.getCart());
            updateCartBadge();
        }
    });

})();