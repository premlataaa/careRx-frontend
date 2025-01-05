// products.js
import {
    fetchProducts,
    getUniqueCategories,
    filterProducts,
    formatPrice,
    addToCart,
    updateCartCount,
    getCart
} from './utils.js';

let allProducts = [];
let currentFilters = {
    search: '',
    categories: new Set(), 
    minPrice: 0,
    maxPrice: 5000,
    sortBy: 'default'
};


async function initializeProducts() {
    try {
        allProducts = await fetchProducts();
        setupCategories();
        setupEventListeners();
        setupPriceRange();
        renderProducts();
        updateCartCount();
    } catch (error) {
        console.error('Error initializing products:', error);
    }
}


function setupCategories() {
    const categories = getUniqueCategories(allProducts);
    const categoriesList = document.getElementById('categories-list');
    
    if (!categoriesList) {
        console.error('Categories list element not found');
        return;
    }
    
    categoriesList.innerHTML = '';

   
    categories.forEach(category => {
        const label = document.createElement('label');
        label.className = 'category-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = category;
        checkbox.addEventListener('change', handleCategoryChange);

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${category}`));
        
        categoriesList.appendChild(label);
    });
}

function handleCategoryChange(event) {
    const category = event.target.value;
    
    if (event.target.checked) {
        currentFilters.categories.add(category);
    } else {
        currentFilters.categories.delete(category);
    }
    
    renderProducts();
}
function setupPriceRange() {
    const priceRange = document.getElementById('price-range');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');

    if (!priceRange || !minPriceInput || !maxPriceInput) {
        console.error('Price range elements not found');
        return;
    }

    // Find max price from products
    const maxPrice = Math.max(...allProducts.map(p => p.price));
    
    // Set initial values
    priceRange.max = maxPrice;
    maxPriceInput.value = maxPrice;
    currentFilters.maxPrice = maxPrice;
    minPriceInput.value = 0;
    currentFilters.minPrice = 0;

    // Add event listeners
    priceRange.addEventListener('input', (e) => {
        const value = e.target.value;
        maxPriceInput.value = value;
        currentFilters.maxPrice = Number(value);
        renderProducts();
    });

    minPriceInput.addEventListener('change', (e) => {
        const value = Math.max(0, Number(e.target.value));
        minPriceInput.value = value; // Update input with validated value
        currentFilters.minPrice = value;
        renderProducts();
    });

    maxPriceInput.addEventListener('change', (e) => {
        const value = Math.min(maxPrice, Number(e.target.value));
        maxPriceInput.value = value; // Update input with validated value
        priceRange.value = value;
        currentFilters.maxPrice = value;
        renderProducts();
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            currentFilters.search = e.target.value.toLowerCase();
            renderProducts();
        }, 300));
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentFilters.sortBy = e.target.value;
            renderProducts();
        });
    }
}

// Get quantity for a product from cart
function getProductQuantityInCart(productId) {
    const cart = getCart();
    const cartItem = cart.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
}

// Render filtered products
function renderProducts() {
    let filteredProducts = allProducts;

    // Apply search filter
    if (currentFilters.search) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(currentFilters.search) ||
            product.description.toLowerCase().includes(currentFilters.search)
        );
    }

    // Apply category filter
    if (currentFilters.categories.size > 0) {
        filteredProducts = filteredProducts.filter(product => 
            currentFilters.categories.has(product.category)
        );
    }

    // Apply price filter
    filteredProducts = filteredProducts.filter(product => 
        product.price >= currentFilters.minPrice && 
        product.price <= currentFilters.maxPrice
    );

    // Apply sorting
    switch (currentFilters.sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    const productsContainer = document.querySelector('.products-grid');
    
    if (!productsContainer) {
        console.error('Products container not found');
        return;
    }

    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-products">
                <p>No products found matching your criteria</p>
            </div>
        `;
        return;
    }

    productsContainer.innerHTML = filteredProducts.map(product => {
        const quantityInCart = getProductQuantityInCart(product.id);
        return `
            <article class="product-card" data-product-id="${product.id}" style="cursor: pointer" onclick="window.location.href='product-details.html?id=${product.id}'">
                <div class="product-image">
                    <img src="${product.image_url?.[0] || ''}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-details">
                    <h2 class="product-title">${product.name}</h2>
                    <div class="product-pricing">
                        <span class="current-price">${formatPrice(product.price)}</span>
                    </div>
                    <div class="product-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" onclick="updateQuantity(${product.id}, -1)">-</button>
                            <span class="quantity" id="quantity-${product.id}">${Math.max(1, quantityInCart || 1)}</span>
                            <button class="quantity-btn plus" onclick="updateQuantity(${product.id}, 1)">+</button>
                        </div>
                        <button class="add-to-cart-btn" onclick="addToCartHandler(${product.id})">
                            ${quantityInCart > 0 ? 'Update Cart' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    attachQuantityListeners();
}

// Rest of the code remains the same (attachQuantityListeners, debounce, updateQuantity, addToCartHandler, showToast)...

function attachQuantityListeners() {
    document.querySelectorAll('.quantity-controls-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default button behavior
            const productCard = e.target.closest('.product-card');
            const productId = parseInt(productCard.dataset.productId);
            const change = e.target.classList.contains('plus') ? 1 : -1;
            updateQuantity(productId, change);
        });
    });
}

// Utility function for debouncing
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

// Update quantity for a product
window.updateQuantity = function (productId, change) {
    const quantityElement = document.getElementById(`quantity-${productId}`);
    let quantity = parseInt(quantityElement.textContent);
    quantity = Math.max(1, quantity + change);
    quantityElement.textContent = quantity;
};

// Handle adding/updating cart
window.addToCartHandler = function (productId) {
    const product = allProducts.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById(`quantity-${productId}`).textContent);

    addToCart(product, quantity);

    // Update the button text
    const button = document.querySelector(`.product-card[data-product-id="${productId}"] .add-to-cart-btn`);
    button.textContent = 'Update Cart';

    showToast(`${quantity} ${product.name} ${quantity > 1 ? 'items' : 'item'} added to cart`);
};

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
initializeProducts();