let currentPage = 1;
const cardsPerPage = 5;
let allProducts = [];
let currentFilteredProducts = [];

function searchProducts() {
    const searchQuery = document.getElementById('searchQuery').value;
    document.getElementById('searchResultText').style.display = 'block';
    document.getElementById('searchResultText').textContent = 'Estamos buscando y comparando los precios de tus productos, espera un momento por favor.';
    fetch(`http://localhost:3000/search?query=${encodeURIComponent(searchQuery)}`)
        .then(response => response.json())
        .then(data => {
            allProducts = [].concat(...Object.values(data));
            if (allProducts.length > 0) {
                document.getElementById('searchResultText').textContent = 'Resultados de búsqueda para: ' + searchQuery;
            } else {
                document.getElementById('searchResultText').textContent = 'No se encontraron productos para: ' + searchQuery;
            }
            currentFilteredProducts = allProducts;
            allProducts.sort((a, b) => a.price - b.price);
            displayFilters();
            currentFilteredProducts = allProducts.slice();
            showCards(currentFilteredProducts);
            setupPagination(currentFilteredProducts);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('searchResultText').textContent = 'Error al buscar productos. Por favor, vuelva a intentarlo.';
        });
}

function showCards(filteredProducts = allProducts) {
    const cardsContainer = document.getElementById('cards-container');
    updateActiveButton();
    cardsContainer.innerHTML = '';
    let start = (currentPage - 1) * cardsPerPage;
    let end = start + cardsPerPage;
    for (let i = start; i < end && i < filteredProducts.length; i++) {
        const product = filteredProducts[i];
        let card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
                    <div class="card-image">
                        <img src="${product.imageUrl}" alt="Imagen de ${product.title}">
                    </div>
                    <div class="card-info">
                        <h3>${product.title}</h3>
                        <p class="price">$${product.price}</p>
                        <p>${product.storeName || 'Nombre de tienda no disponible'}</p>
                        <button onclick="window.open('${product.link}', '_blank')" class="product-button">Ver Producto</button>
                    </div>`;
        cardsContainer.appendChild(card);
    }
}

function setupPagination(filteredProducts) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const pageCount = Math.ceil(filteredProducts.length / cardsPerPage);
    for (let i = 1; i <= pageCount; i++) {
        let button = document.createElement('button');
        button.className = 'page-button';
        button.innerText = i;
        button.addEventListener('click', () => {
            currentPage = i;
            showCards(filteredProducts);
        });
        pagination.appendChild(button);
    }
    updateActiveButton();
}

function updateActiveButton() {
    const buttons = document.querySelectorAll('.page-button');
    buttons.forEach(button => {
        if (parseInt(button.innerText) === currentPage) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function displayFilters() {
    const filtersSection = document.querySelector('.filters');
    filtersSection.style.display = 'block';
    loadStoresFilters();
}

function loadStoresFilters() {
    const stores = [...new Set(allProducts.map(product => product.storeName))];
    const storeFiltersContainer = document.getElementById('storeFilters');
    storeFiltersContainer.innerHTML = '';

    stores.forEach(store => {
        const container = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = store;
        checkbox.value = store;
        checkbox.name = "storeFilter";
        checkbox.checked = true;
        checkbox.addEventListener('change', filterProductsByStore);

        const label = document.createElement('label');
        label.htmlFor = store;
        label.textContent = store;

        container.appendChild(checkbox);
        container.appendChild(label);
        storeFiltersContainer.appendChild(container);
    });
}

function loadStores() {
    const storeSelect = document.getElementById('filterStore');
    stores.forEach(store => {
        const option = document.createElement('option');
        option.value = store;
        option.textContent = store;
        storeSelect.appendChild(option);
    });
}

function sortProducts() {
    const sortOrder = document.querySelector('input[name="sortPrice"]:checked').value;
    if (sortOrder === 'lower') {
        currentFilteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortOrder === 'higher') {
        currentFilteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
    showCards(currentFilteredProducts);
    setupPagination(currentFilteredProducts);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[name="sortPrice"]').forEach(input => {
        input.addEventListener('change', sortProducts);
    });
});

function filterProductsByStore() {
    const checkedStores = Array.from(document.querySelectorAll('input[name="storeFilter"]:checked')).map(el => el.value);
    if (checkedStores.length > 0) {
        currentFilteredProducts = allProducts.filter(product => checkedStores.includes(product.storeName));
    } else {
        currentFilteredProducts = allProducts.slice();
    }
    setupPagination(currentFilteredProducts);
    showCards(currentFilteredProducts);
    sortProducts();
}