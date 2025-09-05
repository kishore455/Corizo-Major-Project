
        // Global variables
        let cart = [];
        let currentProduct = null;
        let selectedPaymentMethod = null;
        let isAdminLoggedIn = false;

        // Page navigation
        function showPage(pageId) {
            // Hide all pages
            const pages = document.querySelectorAll('.page-section');
            pages.forEach(page => {
                page.classList.remove('active');
            });
            
            // Show selected page
            const selectedPage = document.getElementById(`${pageId}-page`);
            if (selectedPage) {
                selectedPage.classList.add('active');
            }
            
            // Update cart count
            updateCartCount();
            
            // Update order summary on payment page
            if (pageId === 'payment') {
                updateOrderSummary();
            }
        }

        // Product detail view
        function showProductDetail(productId, productName, productPrice) {
            currentProduct = {
                id: productId,
                name: productName,
                price: productPrice
            };
            
            document.getElementById('product-detail-title').textContent = productName;
            document.getElementById('product-detail-price').textContent = `$${productPrice.toFixed(2)}`;
            document.getElementById('product-quantity').value = 1;
            
            showPage('product-detail');
        }

        // Quantity controls for product detail
        function increaseQuantity() {
            const quantityInput = document.getElementById('product-quantity');
            const currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        }

        function decreaseQuantity() {
            const quantityInput = document.getElementById('product-quantity');
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        }

        // Add to cart functions
        function addToCart(productId, productName, productPrice) {
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    quantity: 1
                });
            }
            
            updateCartCount();
            showNotification('Product added to cart!');
        }

        function addToCartFromDetail() {
            if (currentProduct) {
                const quantity = parseInt(document.getElementById('product-quantity').value);
                const existingItem = cart.find(item => item.id === currentProduct.id);
                
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    cart.push({
                        id: currentProduct.id,
                        name: currentProduct.name,
                        price: currentProduct.price,
                        quantity: quantity
                    });
                }
                
                updateCartCount();
                updateCartDisplay();
                showNotification('Product added to cart!');
            }
        }

        function updateCartCount() {
            const cartCount = document.getElementById('cart-count');
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
        }

        function updateCartDisplay() {
            const cartItemsContainer = document.getElementById('cart-items');
            
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="text-center py-5">
                        <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                        <h4>Your cart is empty</h4>
                        <p class="text-muted">Add some products to your cart</p>
                        <button class="btn btn-primary-custom" onclick="showPage('products')">Continue Shopping</button>
                    </div>
                `;
            } else {
                cartItemsContainer.innerHTML = '';
                
                cart.forEach(item => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <img src="https://picsum.photos/seed/product${item.id}/80/80.jpg" alt="${item.name}">
                        <div class="cart-item-details">
                            <div class="cart-item-title">${item.name}</div>
                            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn" onclick="decreaseCartItemQuantity(${item.id})">-</button>
                                <span class="quantity-value">${item.quantity}</span>
                                <button class="quantity-btn" onclick="increaseCartItemQuantity(${item.id})">+</button>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    cartItemsContainer.appendChild(cartItem);
                });
            }
            
            updateOrderSummary();
        }

        function increaseCartItemQuantity(productId) {
            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity += 1;
                updateCartDisplay();
                updateCartCount();
            }
        }

        function decreaseCartItemQuantity(productId) {
            const item = cart.find(item => item.id === productId);
            if (item && item.quantity > 1) {
                item.quantity -= 1;
                updateCartDisplay();
                updateCartCount();
            }
        }

        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            updateCartDisplay();
            updateCartCount();
        }

        function updateOrderSummary() {
            const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            const shipping = 5.00;
            const tax = subtotal * 0.1; // 10% tax
            const total = subtotal + shipping + tax;
            
            // Update cart page summary
            document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
            document.getElementById('cart-tax').textContent = `$${tax.toFixed(2)}`;
            document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
            
            // Update payment page summary
            document.getElementById('payment-subtotal').textContent = `$${subtotal.toFixed(2)}`;
            document.getElementById('payment-tax').textContent = `$${tax.toFixed(2)}`;
            document.getElementById('payment-total').textContent = `$${total.toFixed(2)}`;
        }

        // Payment methods
        function selectPaymentMethod(method) {
            selectedPaymentMethod = method;
            
            // Update UI to show selected method
            const paymentMethods = document.querySelectorAll('.payment-method');
            paymentMethods.forEach(pm => {
                pm.classList.remove('selected');
            });
            event.currentTarget.classList.add('selected');
            
            // Show appropriate payment form
            const cardForm = document.getElementById('card-payment-form');
            const upiForm = document.getElementById('upi-payment-form');
            
            if (method === 'card') {
                cardForm.classList.add('active');
                upiForm.classList.remove('active');
            } else {
                cardForm.classList.remove('active');
                upiForm.classList.add('active');
            }
        }

        function processPayment(event) {
            event.preventDefault();
            
            // Generate random order ID
            const orderId = Math.floor(Math.random() * 1000000);
            document.getElementById('order-id').textContent = orderId;
            
            // Show thank you modal
            const thankYouModal = new bootstrap.Modal(document.getElementById('thankYouModal'));
            thankYouModal.show();
            
            // Clear cart
            cart = [];
            updateCartCount();
            updateCartDisplay();
        }

        // Authentication
        function showAuthTab(tab) {
            const loginTab = document.querySelector('.auth-tab:first-child');
            const registerTab = document.querySelector('.auth-tab:last-child');
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            
            if (tab === 'login') {
                loginTab.classList.add('active');
                registerTab.classList.remove('active');
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            } else {
                loginTab.classList.remove('active');
                registerTab.classList.add('active');
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            }
        }

        function handleLogin(event) {
            event.preventDefault();
            const userId = document.getElementById('login-user-id').value;
            const password = document.getElementById('login-password').value;
            
            // Simple validation (in a real app, this would be server-side)
            if (userId && password) {
                showNotification('Login successful!');
                showPage('home');
            }
        }

        function handleRegister(event) {
            event.preventDefault();
            const userId = document.getElementById('register-user-id').value;
            const email = document.getElementById('register-email').value;
            const phone = document.getElementById('register-phone').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            // Simple validation (in a real app, this would be server-side)
            if (password !== confirmPassword) {
                showNotification('Passwords do not match!', 'error');
                return;
            }
            
            if (userId && email && phone && password) {
                showNotification('Registration successful! Please login.');
                showAuthTab('login');
            }
        }

        // Admin functions
        function handleAdminLogin(event) {
            event.preventDefault();
            const adminId = document.getElementById('admin-id').value;
            const adminPassword = document.getElementById('admin-password').value;
            
            // Simple validation (in a real app, this would be server-side)
            if (adminId === 'admin' && adminPassword === 'admin123') {
                isAdminLoggedIn = true;
                document.getElementById('admin-login-form').style.display = 'none';
                document.getElementById('admin-dashboard').style.display = 'block';
                showNotification('Admin login successful!');
            } else {
                showNotification('Invalid admin credentials!', 'error');
            }
        }

        function logoutAdmin() {
            isAdminLoggedIn = false;
            document.getElementById('admin-login-form').style.display = 'block';
            document.getElementById('admin-dashboard').style.display = 'none';
            document.getElementById('admin-id').value = '';
            document.getElementById('admin-password').value = '';
            showNotification('Admin logged out successfully!');
        }

        // Utility functions
        function showNotification(message, type = 'success') {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} position-fixed`;
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.zIndex = '9999';
            notification.textContent = message;
            
            // Add to body
            document.body.appendChild(notification);
            
            // Remove after 3 seconds
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // Initialize cart display when cart page is shown
        document.addEventListener('DOMContentLoaded', function() {
            // Add event listener for cart page
            document.getElementById('cart-page').addEventListener('transitionend', function() {
                if (this.classList.contains('active')) {
                    updateCartDisplay();
                }
            });
        });
    