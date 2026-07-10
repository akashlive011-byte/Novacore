/* ============================================
   NovaCore - Checkout Page Script
   ============================================ */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
        initSidebarDropdown();
        initProductsDropdown();
        initSearchOverlay();
        loadCheckout();
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
        
        document.addEventListener('click', function(e) { if (!group.contains(e.target)) { isOpen = false; dropdown.style.opacity = '0'; dropdown.style.visibility = 'hidden'; } });
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
    // LOAD CHECKOUT
    // ============================================
    function loadCheckout() {
        if (!window.NovaCoreAPI) return;
        
        var cart = window.NovaCoreAPI.getCart();
        
        if (!cart || cart.length === 0) {
            document.getElementById('empty-checkout').classList.remove('hidden');
            document.getElementById('checkout-form-container').style.display = 'none';
            return;
        }
        
        document.getElementById('empty-checkout').classList.add('hidden');
        document.getElementById('checkout-form-container').style.display = 'grid';
        
        renderOrderItems(cart);
        updateTotals(cart);
        initPlaceOrder();
    }

    // ============================================
    // RENDER ORDER ITEMS
    // ============================================
    function renderOrderItems(cart) {
        var container = document.getElementById('checkout-items');
        if (!container) return;
        
        var html = '';
        cart.forEach(function(item) {
            var itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
            html += '<div class="flex items-center justify-between py-2">';
            html += '<div class="flex-1 min-w-0">';
            html += '<p class="text-sm font-medium text-gray-900 truncate">' + item.name + '</p>';
            html += '<p class="text-xs text-gray-500">Qty: ' + item.quantity + ' × $' + item.price + '</p>';
            html += '</div>';
            html += '<span class="text-sm font-medium text-gray-900 ml-2">$' + itemTotal + '</span>';
            html += '</div>';
        });
        
        container.innerHTML = html;
    }

    // ============================================
    // UPDATE TOTALS
    // ============================================
    function updateTotals(cart) {
        if (!window.NovaCoreAPI) return;
        
        var subtotal = parseFloat(window.NovaCoreAPI.getCartTotal());
        var tax = parseFloat((subtotal * 0.08).toFixed(2));
        var total = (subtotal + tax).toFixed(2);
        
        var subtotalEl = document.getElementById('checkout-subtotal');
        var taxEl = document.getElementById('checkout-tax');
        var totalEl = document.getElementById('checkout-total');
        
        if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
        if (taxEl) taxEl.textContent = '$' + tax.toFixed(2);
        if (totalEl) totalEl.textContent = '$' + total;
    }

    // ============================================
    // SHOW FIELD WARNING
    // ============================================
    function showFieldWarning(fieldId, show, message) {
        var field = document.getElementById(fieldId);
        if (!field) return;
        
        var existing = field.parentElement.querySelector('.field-warning');
        if (existing) existing.remove();
        
        if (show) {
            field.style.borderColor = '#ef4444';
            field.style.borderWidth = '2px';
            
            var warning = document.createElement('p');
            warning.className = 'field-warning text-red-500 text-xs mt-1';
            warning.textContent = message || 'This field is required';
            field.parentElement.appendChild(warning);
        } else {
            field.style.borderColor = '#e5e7eb';
            field.style.borderWidth = '1px';
        }
    }

    // ============================================
    // CLEAR ALL WARNINGS
    // ============================================
    function clearAllWarnings() {
        var fields = [
            'checkout-email', 'checkout-firstname', 'checkout-lastname',
            'checkout-address', 'checkout-city', 'checkout-zip',
            'checkout-card', 'checkout-expiry', 'checkout-cvc'
        ];
        
        fields.forEach(function(id) {
            showFieldWarning(id, false);
        });
    }

    // ============================================
    // GENERATE ORDER NUMBER
    // ============================================
    function generateOrderNumber() {
        var now = new Date();
        return 'NOVA-' + now.getFullYear() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    // ============================================
    // DOWNLOAD RECEIPT AS PDF
    // cartSnapshot is passed in BEFORE cart is cleared
    // ============================================
    function downloadReceiptPDF(orderData, cartSnapshot) {
        var now = new Date();
        var dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        var timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        var orderNumber = orderData.orderNumber;
        
        // Calculate totals from the snapshot (NOT from API which is already cleared)
        var subtotal = 0;
        cartSnapshot.forEach(function(item) {
            subtotal += parseFloat(item.price) * item.quantity;
        });
        var tax = parseFloat((subtotal * 0.08).toFixed(2));
        var total = (subtotal + tax).toFixed(2);
        
        // Build items HTML
        var itemsHTML = '';
        cartSnapshot.forEach(function(item) {
            var itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
            itemsHTML += '<tr>';
            itemsHTML += '<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">' + item.name + ' × ' + item.quantity + '</td>';
            itemsHTML += '<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">$' + itemTotal + '</td>';
            itemsHTML += '</tr>';
        });
        
        // Build complete HTML for PDF
        var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>NovaCore Receipt</title>';
        html += '<style>';
        html += 'body{font-family:Arial,Helvetica,sans-serif;margin:0;padding:40px;color:#111827;font-size:14px;}';
        html += '.header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #0070c7;}';
        html += '.header h1{color:#0070c7;margin:0 0 5px 0;font-size:24px;}';
        html += '.header p{color:#6b7280;margin:0;font-size:12px;}';
        html += '.section{margin-bottom:20px;}';
        html += '.section h2{color:#0070c7;font-size:16px;margin:0 0 10px 0;padding-bottom:5px;border-bottom:1px solid #e5e7eb;}';
        html += '.info-row{display:flex;margin-bottom:4px;}';
        html += '.info-label{width:100px;color:#6b7280;font-size:12px;}';
        html += '.info-value{color:#111827;font-size:13px;}';
        html += 'table{width:100%;border-collapse:collapse;margin-bottom:15px;}';
        html += 'th{text-align:left;padding:8px 12px;background:#f9fafb;border-bottom:2px solid #e5e7eb;font-size:12px;color:#6b7280;text-transform:uppercase;}';
        html += '.totals{margin-top:15px;border-top:2px solid #e5e7eb;padding-top:10px;}';
        html += '.total-row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px;}';
        html += '.total-row.final{font-size:16px;font-weight:700;color:#0070c7;margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;}';
        html += '.footer{text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:11px;}';
        html += '@media print{body{padding:20px;}}';
        html += '</style></head><body>';
        
        // Header
        html += '<div class="header">';
        html += '<h1>NOVACORE</h1>';
        html += '<p>Order Receipt</p>';
        html += '</div>';
        
        // Order Info
        html += '<div class="section">';
        html += '<h2>Order Information</h2>';
        html += '<div class="info-row"><span class="info-label">Order Number:</span><span class="info-value">' + orderNumber + '</span></div>';
        html += '<div class="info-row"><span class="info-label">Date:</span><span class="info-value">' + dateStr + ' at ' + timeStr + '</span></div>';
        html += '</div>';
        
        // Customer Info
        html += '<div class="section">';
        html += '<h2>Customer Information</h2>';
        html += '<div class="info-row"><span class="info-label">Name:</span><span class="info-value">' + orderData.firstName + ' ' + orderData.lastName + '</span></div>';
        html += '<div class="info-row"><span class="info-label">Email:</span><span class="info-value">' + orderData.email + '</span></div>';
        html += '<div class="info-row"><span class="info-label">Address:</span><span class="info-value">' + orderData.address + '</span></div>';
        html += '<div class="info-row"><span class="info-label">City/Zip:</span><span class="info-value">' + orderData.city + ', ' + orderData.zip + '</span></div>';
        html += '</div>';
        
        // Order Items
        html += '<div class="section">';
        html += '<h2>Order Items</h2>';
        html += '<table><thead><tr><th>Item</th><th style="text-align:right;">Amount</th></tr></thead><tbody>';
        html += itemsHTML;
        html += '</tbody></table>';
        html += '</div>';
        
        // Totals
        html += '<div class="totals">';
        html += '<div class="total-row"><span>Subtotal</span><span>$' + subtotal.toFixed(2) + '</span></div>';
        html += '<div class="total-row"><span>Tax (8%)</span><span>$' + tax.toFixed(2) + '</span></div>';
        html += '<div class="total-row"><span>Shipping</span><span style="color:#059669;">Free</span></div>';
        html += '<div class="total-row final"><span>Total</span><span>$' + total + '</span></div>';
        html += '</div>';
        
        // Footer
        html += '<div class="footer">';
        html += '<p>Thank you for shopping with NovaCore!</p>';
        html += '<p>NovaCore - Innovating Everyday Life</p>';
        html += '<p>&copy; ' + now.getFullYear() + ' NovaCore. All rights reserved.</p>';
        html += '</div>';
        
        html += '</body></html>';
        
        // Open in new window for print/save as PDF
        var printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            setTimeout(function() {
                printWindow.print();
            }, 500);
        }
        
        // Also trigger download
        var blob = new Blob([html], { type: 'text/html' });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'NovaCore_Receipt_' + orderNumber + '.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        return orderNumber;
    }

    // ============================================
    // VALIDATE & PLACE ORDER
    // ============================================
    function initPlaceOrder() {
        var placeOrderBtn = document.getElementById('place-order-btn');
        if (!placeOrderBtn) return;
        
        placeOrderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear previous warnings
            clearAllWarnings();
            
            // Get values
            var email = document.getElementById('checkout-email').value.trim();
            var firstName = document.getElementById('checkout-firstname').value.trim();
            var lastName = document.getElementById('checkout-lastname').value.trim();
            var address = document.getElementById('checkout-address').value.trim();
            var city = document.getElementById('checkout-city').value.trim();
            var zip = document.getElementById('checkout-zip').value.trim();
            var card = document.getElementById('checkout-card').value.trim();
            var expiry = document.getElementById('checkout-expiry').value.trim();
            var cvc = document.getElementById('checkout-cvc').value.trim();
            
            var hasError = false;
            
            // Validate each required field
            if (!email) { showFieldWarning('checkout-email', true); hasError = true; }
            else if (!isValidEmail(email)) { showFieldWarning('checkout-email', true, 'Please enter a valid email address'); hasError = true; }
            
            if (!firstName) { showFieldWarning('checkout-firstname', true); hasError = true; }
            if (!lastName) { showFieldWarning('checkout-lastname', true); hasError = true; }
            if (!address) { showFieldWarning('checkout-address', true); hasError = true; }
            if (!city) { showFieldWarning('checkout-city', true); hasError = true; }
            if (!zip) { showFieldWarning('checkout-zip', true); hasError = true; }
            if (!card) { showFieldWarning('checkout-card', true); hasError = true; }
            if (!expiry) { showFieldWarning('checkout-expiry', true); hasError = true; }
            if (!cvc) { showFieldWarning('checkout-cvc', true); hasError = true; }
            
            // Scroll to first error
            if (hasError) {
                var firstError = document.querySelector('.field-warning');
                if (firstError) {
                    var inputEl = firstError.parentElement.querySelector('input');
                    if (inputEl) inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                if (window.showToast) window.showToast('Please fill in all required fields.', 'error');
                return;
            }
            
            // Process order
            placeOrderBtn.textContent = 'Processing...';
            placeOrderBtn.disabled = true;
            placeOrderBtn.style.opacity = '0.7';
            
            // CAPTURE CART SNAPSHOT BEFORE CLEARING
            var cartSnapshot = JSON.parse(JSON.stringify(window.NovaCoreAPI.getCart()));
            
            var orderNumber = generateOrderNumber();
            
            var orderData = {
                orderNumber: orderNumber,
                email: email,
                firstName: firstName,
                lastName: lastName,
                address: address,
                city: city,
                zip: zip
            };
            
            setTimeout(function() {
                // Calculate total from snapshot
                var orderTotal = 0;
                cartSnapshot.forEach(function(item) {
                    orderTotal += parseFloat(item.price) * item.quantity;
                });
                orderTotal = (orderTotal * 1.08).toFixed(2);
                
                // Save order to localStorage BEFORE clearing cart
                var orders = JSON.parse(localStorage.getItem('novacore_orders') || '[]');
                orders.unshift({
                    orderNumber: orderNumber,
                    date: new Date().toISOString(),
                    customer: orderData,
                    items: cartSnapshot,
                    total: orderTotal
                });
                localStorage.setItem('novacore_orders', JSON.stringify(orders));
                
                // NOW clear the cart
                localStorage.removeItem('novacore_cart');
                document.dispatchEvent(new CustomEvent('cartUpdated'));
                
                // Download PDF receipt using the snapshot (cart is already cleared but we have the snapshot)
                downloadReceiptPDF(orderData, cartSnapshot);
                
                // Show success
                var content = document.getElementById('checkout-content');
                if (content) {
                    content.innerHTML = '<div class="text-center py-20">' +
                        '<div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">' +
                        '<svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' +
                        '</div>' +
                        '<h2 class="text-2xl font-display font-bold text-gray-900 mb-2">Order Confirmed!</h2>' +
                        '<p class="text-gray-500 mb-2">Thank you for your order, ' + firstName + '.</p>' +
                        '<p class="text-gray-500 mb-1">Order #: <span class="font-mono font-bold text-novacore-600">' + orderNumber + '</span></p>' +
                        '<p class="text-gray-500 mb-2">A confirmation email will be sent to ' + email + '.</p>' +
                        '<p class="text-sm text-green-600 mb-6">✓ A print dialog has opened - save as PDF to keep your receipt.</p>' +
                        '<div class="flex flex-col sm:flex-row gap-3 justify-center">' +
                        '<a href="../index.html" class="inline-flex items-center justify-center px-6 py-3 bg-novacore-600 text-white font-semibold rounded-full hover:bg-novacore-700 transition-colors">Continue Shopping</a>' +
                        '<button id="download-again-btn" class="inline-flex items-center justify-center px-6 py-3 border-2 border-novacore-600 text-novacore-600 font-semibold rounded-full hover:bg-novacore-50 transition-colors">' +
                        '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>' +
                        'Download Receipt Again</button>' +
                        '</div>' +
                        '</div>';
                    
                    // Re-download button uses the same snapshot
                    var downloadAgainBtn = document.getElementById('download-again-btn');
                    if (downloadAgainBtn) {
                        downloadAgainBtn.addEventListener('click', function() {
                            downloadReceiptPDF(orderData, cartSnapshot);
                            if (window.showToast) window.showToast('Receipt download started!', 'success');
                        });
                    }
                }
                
                updateCartBadge();
            }, 1500);
        });
    }

    // ============================================
    // VALIDATE EMAIL
    // ============================================
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
        updateCartBadge();
        if (window.NovaCoreAPI) {
            var cart = window.NovaCoreAPI.getCart();
            if (cart.length === 0) {
                var emptyEl = document.getElementById('empty-checkout');
                var formEl = document.getElementById('checkout-form-container');
                if (emptyEl) emptyEl.classList.remove('hidden');
                if (formEl) formEl.style.display = 'none';
            }
        }
    });

})();