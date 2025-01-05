
const CART_STORAGE_KEY = "CareRx_cart";

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
  } catch (error) {
    console.error("Error getting cart:", error);
    return [];
  }
}

export function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
  } catch (error) {
    console.error("Error saving cart:", error);
  }
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      ...product,
      quantity,
      addedAt: new Date().toISOString(),
    });
  }

  saveCart(cart);
}

export function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
}

export function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    const count = getCart().reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
  }
}

// Price Formatting
export function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

// API Calls
export async function fetchProducts() {
  try {
    const response = await fetch("http://localhost:3000/products");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Category Management
export function getUniqueCategories(products) {
  return [...new Set(products.map((product) => product.category))].sort();
}

// Search and Filter
// Update this function in utils.js
export function filterProducts(products, filters) {
  return products
    .filter((product) => {
      const matchesSearch =
        !filters.search ||
        product.name.toLowerCase().includes(filters.search) ||
        product.description.toLowerCase().includes(filters.search);

      const matchesCategory =
        filters.categories.size === 0 ||
        filters.categories.has(product.category);

      const matchesPrice =
        product.price >= filters.minPrice && product.price <= filters.maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
}
