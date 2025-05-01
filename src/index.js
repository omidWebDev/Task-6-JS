import { productsData } from "./products.js";

class Cart {
    constructor() {
        this.items = [];
        this.loadCart();
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
        this.updateCartUI();
        this.updateProductButtons();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartUI();
        this.updateProductButtons();
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.saveCart();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        // Reset the product button state
        const button = document.querySelector(`.add-to-cart[data-id="${productId}"]`);
        if (button) {
            button.textContent = 'Add to Cart';
            button.disabled = false;
        }
    }

    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            if (item.quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.saveCart();
            }
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    updateProductButtons() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            const id = parseInt(button.dataset.id);
            const isInCart = this.items.some(item => item.id === id);
            button.textContent = isInCart ? 'In Cart' : 'Add to Cart';
            button.disabled = isInCart;
        });
    }

    updateCartUI() {
        const cartCount = document.querySelector('.cart-count');
        const cartItems = document.querySelector('.cart-items');
        const subtotal = document.querySelector('.subtotal');
        const tax = document.querySelector('.tax');
        const total = document.querySelector('.total');

        // Update cart count
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update cart items
        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-price">$${item.price}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Update totals
        const subtotalAmount = this.getTotal();
        const taxAmount = subtotalAmount * 0.1;
        const totalAmount = subtotalAmount + taxAmount;

        subtotal.textContent = `$${subtotalAmount.toFixed(2)}`;
        tax.textContent = `$${taxAmount.toFixed(2)}`;
        total.textContent = `$${totalAmount.toFixed(2)}`;
    }
}

class UI {
    constructor() {
        this.cart = new Cart();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Cart icon click
        document.querySelector('.cart-icon').addEventListener('click', () => {
            document.querySelector('.cart-modal').classList.add('active');
        });

        // Close cart button
        document.querySelector('.close-cart').addEventListener('click', () => {
            document.querySelector('.cart-modal').classList.remove('active');
        });

        // Cart item quantity controls
        document.querySelector('.cart-items').addEventListener('click', (e) => {
            if (e.target.classList.contains('decrease')) {
                const id = parseInt(e.target.dataset.id);
                const item = this.cart.items.find(item => item.id === id);
                if (item) {
                    this.cart.updateQuantity(id, item.quantity - 1);
                }
            } else if (e.target.classList.contains('increase')) {
                const id = parseInt(e.target.dataset.id);
                const item = this.cart.items.find(item => item.id === id);
                if (item) {
                    this.cart.updateQuantity(id, item.quantity + 1);
                }
            } else if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
                const id = parseInt(e.target.dataset.id || e.target.closest('.remove-item').dataset.id);
                this.cart.removeItem(id);
            }
        });

        // Checkout button
        document.querySelector('.checkout-btn').addEventListener('click', () => {
            if (this.cart.items.length > 0) {
                alert('Thank you for your purchase!');
                this.cart.items = [];
                this.cart.saveCart();
                document.querySelector('.cart-modal').classList.remove('active');
            } else {
                alert('Your cart is empty!');
            }
        });
    }

    displayProducts(products) {
        const productContainer = document.querySelector('.product-container');
        productContainer.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">
                        <span class="price">$${product.price}</span>
                        <button class="add-to-cart" data-id="${product.id}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const product = products.find(p => p.id === id);
                if (product) {
                    this.cart.addItem(product);
                }
            });
        });

        // Update button states based on cart
        this.cart.updateProductButtons();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    ui.displayProducts(productsData);
});
