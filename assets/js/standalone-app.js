// Standalone Seya Detergents App - No Dependencies Required
// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

function showInstallButton() {
  const installButton = document.createElement('button');
  installButton.textContent = 'Install App';
  installButton.className = 'install-button';
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--seya-red);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transition: transform 0.2s ease;
  `;
  
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      deferredPrompt = null;
      installButton.remove();
    }
  });
  
  installButton.addEventListener('mouseenter', () => {
    installButton.style.transform = 'scale(1.05)';
  });
  
  installButton.addEventListener('mouseleave', () => {
    installButton.style.transform = 'scale(1)';
  });
  
  document.body.appendChild(installButton);
}

// Shopping Cart functionality
class ShoppingCart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('seyaCart') || '[]');
    this.init();
  }
  
  init() {
    this.updateCartCount();
    this.createCartIcon();
    this.bindEvents();
  }
  
  createCartIcon() {
    const cartIcon = document.createElement('div');
    cartIcon.className = 'cart-icon';
    cartIcon.innerHTML = `
      <div class="cart-container">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
        <span class="cart-count">0</span>
      </div>
    `;
    cartIcon.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--seya-blue);
      color: white;
      padding: 12px;
      border-radius: 50%;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: transform 0.2s ease;
    `;
    
    cartIcon.addEventListener('click', () => this.toggleCart());
    cartIcon.addEventListener('mouseenter', () => {
      cartIcon.style.transform = 'scale(1.1)';
    });
    cartIcon.addEventListener('mouseleave', () => {
      cartIcon.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(cartIcon);
    this.cartIcon = cartIcon;
  }
  
  addToCart(product) {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
    
    this.saveCart();
    this.updateCartCount();
    this.showNotification(`${product.name} added to cart!`);
  }
  
  removeFromCart(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartCount();
    this.updateCartModal();
  }
  
  updateCartCount() {
    const count = this.items.reduce((total, item) => total + item.quantity, 0);
    const countElement = document.querySelector('.cart-count');
    if (countElement) {
      countElement.textContent = count;
      countElement.style.display = count > 0 ? 'block' : 'none';
    }
  }
  
  saveCart() {
    localStorage.setItem('seyaCart', JSON.stringify(this.items));
  }
  
  toggleCart() {
    if (this.currentModal) {
      this.closeCart();
      return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = `
      <div class="cart-overlay" onclick="cart.closeCart()">
        <div class="cart-content" onclick="event.stopPropagation()">
          <div class="cart-header">
            <h2>Shopping Cart</h2>
            <button class="close-btn" onclick="cart.closeCart()">×</button>
          </div>
          <div class="cart-items" id="cart-items-container">
            ${this.renderCartItems()}
          </div>
          <div class="cart-total">
            <strong>Total: R${this.getTotal().toFixed(2)}</strong>
          </div>
          <div class="cart-actions">
            <button class="btn checkout-btn" onclick="cart.checkout()">Checkout via WhatsApp</button>
            <button class="btn secondary-btn" onclick="cart.clearCart()">Clear Cart</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.currentModal = modal;
    document.body.style.overflow = 'hidden';
  }
  
  renderCartItems() {
    if (this.items.length === 0) {
      return '<p class="empty-cart">Your cart is empty</p>';
    }
    
    return this.items.map(item => `
      <div class="cart-item">
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <span class="item-price">R${item.price.toFixed(2)}</span>
        </div>
        <div class="item-controls">
          <button onclick="cart.decreaseQuantity('${item.id}')">-</button>
          <span class="quantity">${item.quantity}</span>
          <button onclick="cart.increaseQuantity('${item.id}')">+</button>
          <button class="remove-btn" onclick="cart.removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    `).join('');
  }
  
  updateCartModal() {
    const container = document.getElementById('cart-items-container');
    const totalElement = document.querySelector('.cart-total strong');
    
    if (container) {
      container.innerHTML = this.renderCartItems();
    }
    
    if (totalElement) {
      totalElement.textContent = `Total: R${this.getTotal().toFixed(2)}`;
    }
  }
  
  increaseQuantity(productId) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity += 1;
      this.saveCart();
      this.updateCartCount();
      this.updateCartModal();
    }
  }
  
  decreaseQuantity(productId) {
    const item = this.items.find(item => item.id === productId);
    if (item && item.quantity > 1) {
      item.quantity -= 1;
      this.saveCart();
      this.updateCartCount();
      this.updateCartModal();
    }
  }
  
  clearCart() {
    this.items = [];
    this.saveCart();
    this.updateCartCount();
    this.updateCartModal();
    this.showNotification('Cart cleared!');
  }
  
  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  
  checkout() {
    if (this.items.length === 0) {
      this.showNotification('Your cart is empty!');
      return;
    }
    
    // Show customer information form
    this.showCustomerForm();
  }
  
  showCustomerForm() {
    const formModal = document.createElement('div');
    formModal.className = 'customer-form-modal';
    formModal.innerHTML = `
      <div class="form-overlay" onclick="cart.closeCustomerForm()">
        <div class="form-content" onclick="event.stopPropagation()">
          <div class="form-header">
            <h2>Customer Information</h2>
            <button class="close-btn" onclick="cart.closeCustomerForm()">×</button>
          </div>
          <form id="customer-form">
            <div class="form-group">
              <label for="customer-name">Full Name *</label>
              <input type="text" id="customer-name" required>
            </div>
            <div class="form-group">
              <label for="customer-phone">Phone Number *</label>
              <input type="tel" id="customer-phone" required>
            </div>
            <div class="form-group">
              <label for="customer-email">Email Address</label>
              <input type="email" id="customer-email">
            </div>
            <div class="form-group">
              <label for="customer-address">Delivery Address *</label>
              <textarea id="customer-address" rows="3" required placeholder="Street address, city, postal code"></textarea>
            </div>
            <div class="form-group">
              <label for="delivery-notes">Delivery Notes</label>
              <textarea id="delivery-notes" rows="2" placeholder="Any special instructions for delivery"></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn checkout-btn">Complete Order</button>
              <button type="button" class="btn secondary-btn" onclick="cart.closeCustomerForm()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(formModal);
    this.customerFormModal = formModal;
    
    // Add form submission handler
    document.getElementById('customer-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.processOrder();
    });
    
    // Focus on first input
    document.getElementById('customer-name').focus();
  }
  
  processOrder() {
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const email = document.getElementById('customer-email').value;
    const address = document.getElementById('customer-address').value;
    const notes = document.getElementById('delivery-notes').value;
    
    // Validate required fields
    if (!name || !phone || !address) {
      this.showNotification('Please fill in all required fields!');
      return;
    }
    
    // Build order message
    const orderItems = this.items.map(item => 
      `${item.name} x${item.quantity} - R${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const customerInfo = `Customer Information:\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      (email ? `Email: ${email}\n` : '') +
      `Address: ${address}\n` +
      (notes ? `Notes: ${notes}\n` : '');
    
    const orderSummary = `\n\nOrder Details:\n${orderItems}\n\nTotal: R${this.getTotal().toFixed(2)}`;
    
    const whatsappMessage = `Hi, I'd like to place an order:\n\n${customerInfo}${orderSummary}`;
    
    // Open WhatsApp
    window.open(`https://wa.me/27835550555?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
    
    // Close modals and clear cart
    this.closeCustomerForm();
    this.closeCart();
    this.clearCart();
    this.showNotification('Order sent successfully!');
  }
  
  closeCustomerForm() {
    if (this.customerFormModal) {
      this.customerFormModal.remove();
      this.customerFormModal = null;
    }
  }
  
  closeCart() {
    if (this.currentModal) {
      this.currentModal.remove();
      this.currentModal = null;
      document.body.style.overflow = 'auto';
    }
  }
  
  bindEvents() {
    // Add event delegation for add to cart buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-cart')) {
        const productCard = e.target.closest('.product-card');
        if (productCard) {
          const product = {
            id: productCard.dataset.productId || productCard.querySelector('h3').textContent,
            name: productCard.querySelector('h3').textContent,
            price: parseFloat(productCard.querySelector('p')?.textContent.replace('R', '') || '0')
          };
          this.addToCart(product);
        }
      }
    });
  }
  
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: var(--seya-red);
      color: white;
      padding: 12px 20px;
      border-radius: 5px;
      z-index: 1001;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// Search functionality
class SearchEngine {
  constructor() {
    this.products = [];
    this.init();
  }
  
  init() {
    this.createSearchBox();
    this.loadProducts();
  }
  
  createSearchBox() {
    const searchBox = document.createElement('div');
    searchBox.className = 'search-box';
    searchBox.innerHTML = `
      <input type="text" placeholder="Search products..." id="productSearch">
      <div class="search-results" id="searchResults"></div>
    `;
    
    const header = document.querySelector('header nav');
    if (header) {
      header.appendChild(searchBox);
    }
    
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.search(e.target.value);
      });
      
      // Hide results when clicking outside
      document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target)) {
          this.hideResults();
        }
      });
    }
  }
  
  loadProducts() {
    // Extract product data from the page
    document.querySelectorAll('.product-card').forEach(card => {
      const nameElement = card.querySelector('h3');
      const priceElement = card.querySelector('p');
      
      if (nameElement) {
        const product = {
          id: nameElement.textContent.replace(/\s+/g, '-'),
          name: nameElement.textContent,
          price: priceElement ? priceElement.textContent : '',
          element: card
        };
        this.products.push(product);
      }
    });
  }
  
  search(query) {
    if (!query.trim()) {
      this.hideResults();
      return;
    }
    
    const results = this.products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    
    this.showResults(results);
  }
  
  showResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="search-result-item">No products found</div>';
    } else {
      resultsContainer.innerHTML = results.map(product => `
        <div class="search-result-item" onclick="searchEngine.scrollToProduct('${product.id}')">
          <span>${product.name}</span>
          <span>${product.price}</span>
        </div>
      `).join('');
    }
    
    resultsContainer.style.display = 'block';
  }
  
  scrollToProduct(productId) {
    const product = this.products.find(p => p.id === productId);
    if (product && product.element) {
      product.element.scrollIntoView({ behavior: 'smooth' });
      this.hideResults();
    }
  }
  
  hideResults() {
    const resultsContainer = document.getElementById('searchResults');
    if (resultsContainer) {
      resultsContainer.style.display = 'none';
    }
  }
}

// Simple Performance Monitoring (without dependencies)
class PerformanceMonitor {
  constructor() {
    this.init();
  }
  
  init() {
    // Monitor page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
    });
    
    // Monitor first paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
        });
      });
      
      observer.observe({ entryTypes: ['paint'] });
    }
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered'))
      .catch(error => console.log('SW registration failed'));
  }
  
  // Initialize cart
  window.cart = new ShoppingCart();
  
  // Initialize search
  window.searchEngine = new SearchEngine();
  
  // Initialize performance monitoring
  new PerformanceMonitor();
  
  // Add smooth scrolling to all internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});

// Add enhanced CSS for new features
const style = document.createElement('style');
style.textContent = `
  .cart-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--seya-red);
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    display: none;
  }
  
  .cart-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    z-index: 1002;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
  }
  
  .cart-overlay {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  
  .cart-content {
    background: white;
    padding: 0;
    border-radius: 10px;
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease-out;
  }
  
  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .cart-header h2 {
    margin: 0;
    color: var(--seya-blue);
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--seya-red);
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .cart-items {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
  
  .cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
  }
  
  .item-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .item-name {
    font-weight: 600;
    color: var(--seya-blue);
  }
  
  .item-price {
    color: var(--seya-red);
    font-weight: 500;
  }
  
  .item-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .item-controls button {
    background: var(--seya-blue);
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .remove-btn {
    background: var(--seya-red) !important;
  }
  
  .quantity {
    min-width: 20px;
    text-align: center;
    font-weight: 600;
  }
  
  .cart-total {
    padding: 20px;
    border-top: 1px solid #eee;
    text-align: center;
    font-size: 18px;
    color: var(--seya-blue);
  }
  
  .cart-actions {
    padding: 20px;
    display: flex;
    gap: 10px;
  }
  
  .checkout-btn {
    flex: 1;
    background: var(--seya-red) !important;
  }
  
  .secondary-btn {
    flex: 1;
    background: var(--dark-gray) !important;
  }
  
  .empty-cart {
    text-align: center;
    color: #666;
    padding: 40px 20px;
  }
  
  .search-box {
    position: relative;
    margin: 10px 0;
    width: 100%;
    max-width: 300px;
  }
  
  .search-box input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    box-sizing: border-box;
  }
  
  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 5px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    display: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .search-result-item {
    padding: 10px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    transition: background 0.2s ease;
  }
  
  .search-result-item:hover {
    background: #f5f5f5;
  }
  
  .search-result-item:last-child {
    border-bottom: none;
  }
  
  .add-to-cart {
    background: var(--seya-red);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
    margin-top: 10px;
  }
  
  .add-to-cart:hover {
    background: var(--hover-red);
    transform: scale(1.05);
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  /* Customer Form Modal Styles */
  .customer-form-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    z-index: 1003;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
  }
  
  .form-overlay {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  
  .form-content {
    background: white;
    padding: 0;
    border-radius: 10px;
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease-out;
  }
  
  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
    background: var(--seya-blue);
    color: white;
  }
  
  .form-header h2 {
    margin: 0;
    color: white;
  }
  
  .form-header .close-btn {
    color: white;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: var(--seya-blue);
  }
  
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    box-sizing: border-box;
    transition: border-color 0.2s ease;
  }
  
  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--seya-blue);
  }
  
  .form-group textarea {
    resize: vertical;
    min-height: 80px;
  }
  
  #customer-form {
    padding: 20px;
    flex: 1;
    overflow-y: auto;
  }
  
  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }
  
  .form-actions .btn {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  
  .form-actions .checkout-btn {
    background: var(--seya-red);
    color: white;
  }
  
  .form-actions .checkout-btn:hover {
    background: var(--hover-red);
    transform: scale(1.02);
  }
  
  .form-actions .secondary-btn {
    background: var(--dark-gray);
    color: white;
  }
  
  .form-actions .secondary-btn:hover {
    background: #333;
    transform: scale(1.02);
  }
  
  @media (max-width: 768px) {
    .search-box {
      max-width: 200px;
    }
    
    .cart-content, .form-content {
      margin: 10px;
      max-height: 90vh;
    }
    
    .cart-actions, .form-actions {
      flex-direction: column;
    }
    
    .item-controls {
      flex-wrap: wrap;
      gap: 5px;
    }
    
    .item-controls button {
      padding: 3px 8px;
      font-size: 12px;
    }
    
    .form-group input,
    .form-group textarea {
      font-size: 16px; /* Prevents zoom on iOS */
    }
  }
`;
document.head.appendChild(style);
