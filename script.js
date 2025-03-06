let cart = JSON.parse(localStorage.getItem('cart')) || [];

const cartCount = document.getElementById('cart-count');
const mobileCartCount = document.getElementById('mobile-cart-count');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartToggle = document.getElementById('cart-toggle');
const mobileCartToggle = document.getElementById('mobile-cart-toggle');
const shareCart = document.getElementById('share-cart');
const backToShop = document.getElementById('back-to-shop');
const resetCartBtn = document.getElementById('reset-cart');
const cartNotification = document.getElementById('cart-notification');
const confirmModal = document.getElementById('confirm-modal');
const orderSummary = document.getElementById('order-summary');
const modalConfirm = document.getElementById('modal-confirm');
const modalCancel = document.getElementById('modal-cancel');
const resetModal = document.getElementById('reset-modal');
const resetConfirm = document.getElementById('reset-confirm');
const resetCancel = document.getElementById('reset-cancel');
const emptyCartModal = document.getElementById('empty-cart-modal');
const emptyCartClose = document.getElementById('empty-cart-close');

// Quantity Functions
function increaseQuantity(button) {
    const input = button.previousElementSibling;
    let value = parseInt(input.value) || 1;
    input.value = value + 1;
}

function decreaseQuantity(button) {
    const input = button.nextElementSibling;
    let value = parseInt(input.value) || 1;
    if (value > 1) input.value = value - 1;
}

// Notification
function showNotification() {
    if (cartNotification) {
        cartNotification.style.display = 'block';
        setTimeout(() => cartNotification.style.display = 'none', 3000);
    }
}

// Save Cart with Limit Check
function saveCart() {
    const cartString = JSON.stringify(cart);
    if (cartString.length > 4 * 1024 * 1024) {
        alert('Cart is too large! Please remove some items.');
        return false;
    }
    localStorage.setItem('cart', cartString);
    return true;
}

// Add to Cart
function setupCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            button.textContent = 'Adding...';
            const productCard = button.closest('.product-card');
            if (!productCard) return console.error('No product card found');

            const name = productCard.getAttribute('data-name');
            const priceGBP = parseFloat(productCard.getAttribute('data-price'));
            const quantity = parseInt(productCard.querySelector('.quantity-input').value) || 1;

            if (!name || isNaN(priceGBP)) {
                alert('Failed to add item. Invalid product data.');
                button.textContent = 'Add to Cart';
                return;
            }

            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({ name, price: priceGBP, quantity });
            }

            if (saveCart()) {
                updateCartDisplay();
                showNotification();
            }
            button.textContent = 'Add to Cart';
        });
    });
}

// Mobile Cart Toggle
mobileCartToggle?.addEventListener('click', () => window.location.href = 'cart.html');

// Navbar Toggle
const navToggle = document.getElementById('nav-toggle');
if (navToggle) {
    navToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.classList.toggle('open');
            console.log('Navbar toggled:', navLinks.classList.contains('open'));
        } else {
            console.error('Nav links not found.');
        }
    });
    console.log('Nav toggle found:', navToggle.style.display);
} else {
    console.error('Nav toggle button not found.');
}

// Ensure navbar is collapsed on mobile load
function initializeNavbar() {
    const navLinks = document.querySelector('.nav-links');
    const navToggle = document.getElementById('nav-toggle');
    if (window.innerWidth <= 768 && navLinks) {
        navLinks.classList.remove('open');
        console.log('Navbar initialized as collapsed on mobile');
        if (navToggle) {
            navToggle.style.display = 'block';
        }
    }
}

// Reset Cart
resetCartBtn?.addEventListener('click', () => {
    if (cart.length === 0) {
        if (emptyCartModal) {
            emptyCartModal.style.display = 'flex';
            emptyCartClose.onclick = () => {
                emptyCartModal.style.display = 'none';
            };
        }
        return;
    }
    if (resetModal) {
        resetModal.style.display = 'flex';

        resetConfirm.onclick = () => {
            cart = [];
            saveCart();
            updateCartDisplay();
            updateCartContent();
            resetModal.style.display = 'none';
        };

        resetCancel.onclick = () => {
            resetModal.style.display = 'none';
        };
    } else {
        console.error('Reset modal not found.');
    }
});

// Confirm Order via WhatsApp
shareCart?.addEventListener('click', () => {
    if (cart.length === 0) {
        if (emptyCartModal) {
            emptyCartModal.style.display = 'flex';
            emptyCartClose.onclick = () => {
                emptyCartModal.style.display = 'none';
            };
        }
        return;
    }
    const summary = `Review your order:\n${cart.map(item => `${item.name}: ${item.quantity}`).join('\n')}\nTotal: £${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}`;
    if (confirmModal && orderSummary) {
        orderSummary.textContent = summary;
        confirmModal.style.display = 'flex';

        modalConfirm.onclick = () => {
            const orderDetails = `NepalMart Order:\n${cart.map(item => `${item.name}: £${item.price.toFixed(2)} x ${item.quantity}`).join('\n')}\nTotal: £${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}`;
            const encodedMessage = encodeURIComponent(orderDetails);
            const whatsappUrl = `https://wa.me/447467579650?text=${encodedMessage}`;
            
            console.log('WhatsApp URL:', whatsappUrl);
            const whatsappWindow = window.open(whatsappUrl, '_blank');
            if (!whatsappWindow) alert('Failed to open WhatsApp. Please allow pop-ups or try manually: ' + whatsappUrl);
            confirmModal.style.display = 'none';
        };

        modalCancel.onclick = () => {
            confirmModal.style.display = 'none';
        };
    } else {
        console.error('Confirm modal elements not found.');
    }
});

// Back to Shopping
backToShop?.addEventListener('click', () => window.location.href = 'index.html');

// Update Cart Display
function updateCartDisplay() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCount) cartCount.textContent = count;
    if (mobileCartCount) mobileCartCount.textContent = count;
    if (window.location.pathname.includes('cart.html')) updateCartContent();
}

// Update Cart Content
function updateCartContent() {
    if (!cartItems || !cartTotal) return;
    cartItems.innerHTML = '';
    let totalGBP = 0;
    cart.forEach(item => {
        const itemTotalGBP = item.price * item.quantity;
        totalGBP += itemTotalGBP;
        cartItems.innerHTML += `
            <li>
                <span>${item.name}</span>
                <span>£${item.price.toFixed(2)}</span>
                <span>${item.quantity}</span>
                <span>£${itemTotalGBP.toFixed(2)}</span>
            </li>
        `;
    });
    cartTotal.textContent = totalGBP.toFixed(2);
}

// Filter Products
function filterProducts() {
    const category = document.getElementById('category')?.value;
    if (!category) return;
    document.querySelectorAll('.subcategory').forEach(subcategory => {
        subcategory.style.display = (category === 'all' || subcategory.getAttribute('data-category') === category) ? 'block' : 'none';
    });
}

// Search Products
document.getElementById('search')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = card.getAttribute('data-name').toLowerCase().includes(query) ? 'block' : 'none';
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupCartButtons();
    filterProducts();
    updateCartDisplay();
    if (window.location.pathname.includes('cart.html')) updateCartContent();
    initializeNavbar();
});