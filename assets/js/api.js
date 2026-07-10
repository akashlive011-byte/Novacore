/* ============================================
   NovaCore - API & Data Handler
   ============================================ */

(function() {
  'use strict';
  
  var API = {
    // Base URL is relative to the HTML page loading this script
    // Script is at assets/js/api.js
    // Data is at assets/data/products.json
    // From root: assets/data/
    // From categories/: ../assets/data/
    baseURL: '',
    cache: {},
    cacheTimeout: 300000
  };
  
  // Auto-detect base URL based on current page location
  function getBaseURL() {
    var path = window.location.pathname;
    // If in a subfolder like /categories/, need ../ prefix
    if (path.indexOf('/categories/') !== -1 ||
      path.indexOf('/Products/') !== -1 ||
      path.indexOf('/Cart/') !== -1 ||
      path.indexOf('/checkout/') !== -1 ||
      path.indexOf('/search/') !== -1 ||
      path.indexOf('/labs/') !== -1 ||
      path.indexOf('/admin/') !== -1) {
      return '../assets/data/';
    }
    return 'assets/data/';
  }
  
  // ============================================
  // Fetch Products
  // ============================================
  API.getProducts = function() {
    return API.fetchData('products.json');
  };
  
  // ============================================
  // Get Product by ID
  // ============================================
  API.getProductById = function(id) {
    return API.getProducts().then(function(products) {
      return products.find(function(product) {
        return product.id === id;
      }) || null;
    });
  };
  
  // ============================================
  // Get Products by Category
  // ============================================
  API.getProductsByCategory = function(category) {
    return API.getProducts().then(function(products) {
      return products.filter(function(product) {
        return product.category.toLowerCase() === category.toLowerCase();
      });
    });
  };
  
  // ============================================
  // Search Products
  // ============================================
  API.searchProducts = function(query) {
    return API.getProducts().then(function(products) {
      var q = query.toLowerCase();
      return products.filter(function(product) {
        return product.name.toLowerCase().indexOf(q) > -1 ||
          product.category.toLowerCase().indexOf(q) > -1 ||
          (product.description && product.description.toLowerCase().indexOf(q) > -1);
      });
    });
  };
  
  // ============================================
  // Get Featured Products
  // ============================================
  API.getFeaturedProducts = function(limit) {
    limit = limit || 6;
    return API.getProducts().then(function(products) {
      return products.slice(0, limit);
    });
  };
  
  // ============================================
  // Get Categories
  // ============================================
  API.getCategories = function() {
    return API.getProducts().then(function(products) {
      var categories = [];
      var seen = {};
      
      products.forEach(function(product) {
        if (!seen[product.category]) {
          seen[product.category] = true;
          categories.push({
            name: product.category,
            slug: product.category.toLowerCase().replace(/\s+/g, '-'),
            count: 0
          });
        }
      });
      
      products.forEach(function(product) {
        var cat = categories.find(function(c) {
          return c.name === product.category;
        });
        if (cat) cat.count++;
      });
      
      return categories;
    });
  };
  
  // ============================================
  // Core Fetch Function with Caching
  // ============================================
  API.fetchData = function(endpoint) {
    var baseURL = getBaseURL();
    var url = baseURL + endpoint;
    var now = Date.now();
    
    // Log for debugging
    console.log('Fetching:', url);
    
    // Return cached data if valid
    if (API.cache[url] && (now - API.cache[url].timestamp) < API.cacheTimeout) {
      console.log('Using cached data for:', url);
      return Promise.resolve(API.cache[url].data);
    }
    
    return fetch(url)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Failed to load: ' + url + ' (Status: ' + response.status + ')');
        }
        return response.json();
      })
      .then(function(data) {
        // Cache the response
        API.cache[url] = {
          data: data,
          timestamp: now
        };
        console.log('Successfully loaded:', url, '- Items:', data.length);
        return data;
      })
      .catch(function(error) {
        console.error('API Error:', error.message);
        // Return cached data if available, even if expired
        if (API.cache[url]) {
          console.log('Using expired cache for:', url);
          return API.cache[url].data;
        }
        throw error;
      });
  };
  
  // ============================================
  // Clear Cache
  // ============================================
  API.clearCache = function() {
    API.cache = {};
  };
  
  // ============================================
  // Cart Operations
  // ============================================
  API.getCart = function() {
    try {
      var cartData = localStorage.getItem('novacore_cart');
      return cartData ? JSON.parse(cartData) : [];
    } catch (e) {
      return [];
    }
  };
  
  API.saveCart = function(cart) {
    try {
      localStorage.setItem('novacore_cart', JSON.stringify(cart));
      document.dispatchEvent(new CustomEvent('cartUpdated'));
      return true;
    } catch (e) {
      console.error('Cart save error:', e);
      return false;
    }
  };
  
  API.addToCart = function(productId, quantity) {
    quantity = quantity || 1;
    
    return API.getProductById(productId).then(function(product) {
      if (!product) {
        throw new Error('Product not found: ' + productId);
      }
      
      var cart = API.getCart();
      var existingIndex = cart.findIndex(function(item) {
        return item.id === productId;
      });
      
      if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity,
          addedAt: new Date().toISOString()
        });
      }
      
      API.saveCart(cart);
      return cart;
    });
  };
  
  API.removeFromCart = function(productId) {
    var cart = API.getCart();
    cart = cart.filter(function(item) {
      return item.id !== productId;
    });
    API.saveCart(cart);
    return cart;
  };
  
  API.updateCartQuantity = function(productId, quantity) {
    var cart = API.getCart();
    var item = cart.find(function(i) {
      return i.id === productId;
    });
    
    if (item) {
      if (quantity <= 0) {
        return API.removeFromCart(productId);
      }
      item.quantity = quantity;
      API.saveCart(cart);
    }
    
    return cart;
  };
  
  API.getCartTotal = function() {
    var cart = API.getCart();
    return cart.reduce(function(total, item) {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0).toFixed(2);
  };
  
  API.getCartCount = function() {
    var cart = API.getCart();
    return cart.reduce(function(count, item) {
      return count + item.quantity;
    }, 0);
  };
  
  // ============================================
  // Expose API globally
  // ============================================
  window.NovaCoreAPI = API;
  console.log('NovaCore API initialized. Base URL auto-detection active.');
  
})();