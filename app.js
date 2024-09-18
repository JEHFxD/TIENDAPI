const containerProducts = document.getElementById('containerProducts');
const categorySelect = document.getElementById('categorySelect');
const priceSelect = document.getElementById('priceSelect');
const cartItems = document.getElementById('cartItems');
const totalPriceElement = document.getElementById('totalPrice');
const clearCartButton = document.getElementById('clearCart');
const url = 'https://fakestoreapi.com/products';

let products = [];
let categories = new Set();

const fetchProducts = async () => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error en la respuesta de la API');
        const data = await response.json();
        products = data;
        categories = new Set(data.map(product => product.category));
        updateCategoryOptions();
        renderProducts(products);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
    }
};

const updateCategoryOptions = () => {
    categorySelect.innerHTML = '<option value="all">Todas</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
};

const renderProducts = (productsToRender) => {
    containerProducts.innerHTML = '';
    productsToRender.forEach(product => makeProductCard(product));
};

const makeProductCard = (product) => {
    const { id, title, price, image } = product;

    const productCard = document.createElement('div');
    productCard.classList.add('card-product');
    productCard.id = id;

    const imgElement = document.createElement('img');
    imgElement.src = image;
    imgElement.alt = title;

    const titleElement = document.createElement('h2');
    titleElement.textContent = title;

    const priceElement = document.createElement('p');
    priceElement.textContent = `$${price}`;

    const addButton = document.createElement('button');
    addButton.textContent = 'Agregar al carrito';
    addButton.addEventListener('click', () => addToCart(product));

    productCard.appendChild(imgElement);
    productCard.appendChild(titleElement);
    productCard.appendChild(priceElement);
    productCard.appendChild(addButton);

    containerProducts.appendChild(productCard);
};

const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += 1;
        existingProduct.totalPrice += product.price;
    } else {
        cart.push({
            id: product.id,
            name: product.title,
            price: product.price,
            quantity: 1,
            totalPrice: product.price
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    updateCartCounter();
};

const updateCartUI = () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartItems.innerHTML = '';
    let totalPrice = 0;

    cart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${item.name} - $${item.price} x ${item.quantity}
            <button class="increase-quantity" data-id="${item.id}">+</button>
            <button class="decrease-quantity" data-id="${item.id}">-</button>
            <button class="remove-from-cart" data-id="${item.id}">Eliminar</button>
        `;
        cartItems.appendChild(li);
        totalPrice += item.totalPrice;
    });

    totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;

    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = parseInt(event.target.getAttribute('data-id'));
            increaseQuantity(productId);
        });
    });

    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = parseInt(event.target.getAttribute('data-id'));
            decreaseQuantity(productId);
        });
    });

    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = parseInt(event.target.getAttribute('data-id'));
            removeFromCart(productId);
        });
    });
};

const increaseQuantity = (productId) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartProduct = cart.find(p => p.id === productId);
    if (cartProduct) {
        cartProduct.quantity += 1;
        cartProduct.totalPrice += cartProduct.price;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }
};

const decreaseQuantity = (productId) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartProduct = cart.find(p => p.id === productId);
    if (cartProduct) {
        if (cartProduct.quantity > 1) {
            cartProduct.quantity -= 1;
            cartProduct.totalPrice -= cartProduct.price;
        } else {
            cart = cart.filter(p => p.id !== productId);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }
};

const removeFromCart = (productId) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(p => p.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
};

const clearCart = () => {
    localStorage.removeItem('cart');
    updateCartUI();
};

const filterProducts = () => {
    const category = categorySelect.value;
    const filteredProducts = category === 'all' ? products : products.filter(p => p.category === category);
    sortProducts(filteredProducts);
};

const sortProducts = (filteredProducts) => {
    const sortedProducts = filteredProducts.sort((a, b) => {
        return priceSelect.value === 'asc' ? a.price - b.price : b.price - a.price;
    });
    renderProducts(sortedProducts);
};

const updateCartCounter = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const counter = document.getElementById("p-counter");
    if (counter) {
        counter.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    categorySelect.addEventListener('change', filterProducts);
    priceSelect.addEventListener('change', filterProducts);
    clearCartButton.addEventListener('click', clearCart);
});
