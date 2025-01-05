// product-details.js
import {
    fetchProducts,
    formatPrice,
    addToCart,
    updateCartCount,
    getCart
} from './utils.js';

let currentProduct = null;

async function initializeProductDetails() {
    try {
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            throw new Error('Product ID not found');
        }

        // Fetch product details
        const response = await fetch(`http://localhost:3000/products/${productId}`);
        if (!response.ok) {
            throw new Error('Product not found');
        }

        currentProduct = await response.json();
        renderProductDetails();
        updateCartCount();
        setupEventListeners();
    } catch (error) {
        console.error('Error loading product:', error);
        document.getElementById('product-details').innerHTML = `
            <div class="error-message">
                <h2>Error loading product</h2>
                <p>${error.message}</p>
                <a href="index.html">Back to Products</a>
            </div>
        `;
    }
}

function getProductQuantityInCart(productId) {
    const cart = getCart();
    const cartItem = cart.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
}

function renderProductDetails() {
    const quantityInCart = getProductQuantityInCart(currentProduct.id);
    const container = document.getElementById('product-details');

    container.innerHTML = `
        <div class="product-details-grid">
            <div class="product-images">
                <div class="main-image">
                    <img src="${currentProduct.image_url[0]}" alt="${currentProduct.name}" id="main-product-image">
                </div>
                <div class="thumbnail-images">
                    ${currentProduct.image_url.map((url, index) => `
                        <img src="${url}" 
                             alt="Product view ${index + 1}" 
                             onclick="changeMainImage('${url}')"
                             class="thumbnail">
                    `).join('')}
                </div>
            </div>
            
            <div class="product-info">
                <h1>${currentProduct.name}</h1>
                <div class="pricing">
                    <span class="current-price">${formatPrice(currentProduct.price)}</span>
                    ${currentProduct.discount ?
            `<span class="discount">${currentProduct.discount}% OFF</span>` :
            ''}
                </div>
                
                <div class="stock-info">
                    ${currentProduct.stock > 0 ?
            `<span class="in-stock">In Stock (${currentProduct.stock} units)</span>` :
            '<span class="out-of-stock">Out of Stock</span>'}
                </div>
<div class = "content-desc">
<p>${currentProduct.title}</p>
<p>${currentProduct.description}</p>
<p>${currentProduct.benefits}</p>
</div>
                <div class="quantity-selector">
                    <button onclick="updateQuantity(-1)" class="quantity-btn">-</button>
                    <span id="quantity">${Math.max(1, quantityInCart || 1)}</span>
                    <button onclick="updateQuantity(1)" class="quantity-btn">+</button>
                </div>

                <button onclick="handleAddToCart()" class="add-to-cart-btn" ${currentProduct.stock <= 0 ? 'disabled' : ''}>
                    ${quantityInCart > 0 ? 'Update Cart' : 'Add to Cart'}
                </button>
                
                <div class="product-category">
                    Category: ${currentProduct.category}
                </div>
            </div>
        </div>
    `;
}

function setupEventListeners() {
    // Add any additional event listeners here
    window.changeMainImage = function (url) {
        document.getElementById('main-product-image').src = url;
    };

    window.updateQuantity = function (change) {
        const quantityElement = document.getElementById('quantity');
        let quantity = parseInt(quantityElement.textContent);
        quantity = Math.max(1, quantity + change);
        quantityElement.textContent = quantity;
    };

    window.handleAddToCart = function () {
        const quantity = parseInt(document.getElementById('quantity').textContent);
        addToCart(currentProduct, quantity);
        renderProductDetails(); // Re-render to update the "Update Cart" button

        // Show confirmation message
        const message = `${quantity} ${currentProduct.name} ${quantity > 1 ? 'items' : 'item'} added to cart`;
        showToast(message);
    };
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2000);
    }, 100);
}

// Initialize the page
initializeProductDetails();