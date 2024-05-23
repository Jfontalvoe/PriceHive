let paginaActual = 1;
const tarjetasPorPagina = 5;
let todosLosProductos = [];
let productosFiltradosActuales = [];

function buscarProductos() {
    const consultaBusqueda = document.getElementById('searchQuery').value;
    document.getElementById('searchResultText').style.display = 'block';
    document.getElementById('searchResultText').innerHTML = '<img src="/assets/images/Loading.gif" alt="Cargando...">';
    fetch(`http://localhost:9000/search?query=${encodeURIComponent(consultaBusqueda)}`)
        .then(respuesta => {
            if (!respuesta.ok) {
                throw new Error('Network response was not ok');
            }
            return respuesta.json();
        })
        .then(datos => {
            todosLosProductos = [].concat(...Object.values(datos));
            if (todosLosProductos.length > 0) {
                document.getElementById('searchResultText').textContent = 'Resultado de la búsqueda de: ' + consultaBusqueda;
            } else {
                document.getElementById('searchResultText').textContent = 'No se encontraron resultados de: ' + consultaBusqueda;
            }
            productosFiltradosActuales = todosLosProductos;
            todosLosProductos.sort((a, b) => a.price - b.price);
            mostrarFiltros();
            productosFiltradosActuales = todosLosProductos.slice();
            mostrarTarjetas(productosFiltradosActuales);
            configurarPaginacion(productosFiltradosActuales);
        })
        .catch(error => {
            console.error('Error:', error);
            if (error instanceof TypeError && error.message.includes('timeout')) {
                document.getElementById('searchResultText').textContent = 'La búsqueda ha tardado demasiado tiempo. Por favor, inténtelo nuevamente.';
            } else {
                document.getElementById('searchResultText').textContent = 'Error al buscar artículos. Por favor, intente nuevamente.';
            }
        });
}

function mostrarTarjetas(productosFiltrados = todosLosProductos) {
    const contenedorTarjetas = document.getElementById('cards-container');
    actualizarBotonActivo();
    contenedorTarjetas.innerHTML = '';
    let inicio = (paginaActual - 1) * tarjetasPorPagina;
    let fin = inicio + tarjetasPorPagina;
    for (let i = inicio; i < fin && i < productosFiltrados.length; i++) {
        const producto = productosFiltrados[i];
        let tarjeta = document.createElement('div');
        tarjeta.className = 'card';
        tarjeta.innerHTML = `
            <div class="card-image">
                <img src="${producto.imageUrl}" alt="Imagen de ${producto.title}">
            </div>
            <div class="card-info">
                <h3>${producto.title}</h3>
                <p class="price">$${producto.price}</p>
                
                <p>${producto.storeName || 'Nombre de tienda no encontrado.'}</p>
                <button onclick="window.open('${producto.link}', '_blank')" class="product-button">Ir a comprar</button>
            </div>`;
        contenedorTarjetas.appendChild(tarjeta);
    }
}

function configurarPaginacion(productosFiltrados) {
    const paginacion = document.getElementById('paginacion');
    paginacion.innerHTML = '';
    const totalPaginas = Math.ceil(productosFiltrados.length / tarjetasPorPagina);
    for (let i = 1; i <= totalPaginas; i++) {
        let boton = document.createElement('button');
        boton.className = 'page-button';
        boton.innerText = i;
        boton.addEventListener('click', () => {
            paginaActual = i;
            mostrarTarjetas(productosFiltrados);
        });
        paginacion.appendChild(boton);
    }
    actualizarBotonActivo();
}

function actualizarBotonActivo() {
    const botones = document.querySelectorAll('.page-button');
    botones.forEach(boton => {
        if (parseInt(boton.innerText) === paginaActual) {
            boton.classList.add('active');
        } else {
            boton.classList.remove('active');
        }
    });
}

function mostrarFiltros() {
    const seccionFiltros = document.querySelector('.filtros');
    seccionFiltros.style.display = 'block';
    cargarFiltrosTiendas();
}

function cargarFiltrosTiendas() {
    const tiendas = [...new Set(todosLosProductos.map(producto => producto.storeName))];
    const contenedorFiltrosTiendas = document.getElementById('filtroTienda');
    contenedorFiltrosTiendas.innerHTML = '';
    tiendas.forEach(tienda => {
        const contenedor = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = tienda;
        checkbox.value = tienda;
        checkbox.name = "filtroTienda";
        checkbox.checked = true;
        checkbox.addEventListener('change', filtrarProductosPorTienda);

        const etiqueta = document.createElement('label');
        etiqueta.htmlFor = tienda;
        etiqueta.textContent = tienda;

        contenedor.appendChild(checkbox);
        contenedor.appendChild(etiqueta);
        contenedorFiltrosTiendas.appendChild(contenedor);
    });
}

function ordenarProductos() {
    const orden = document.querySelector('input[name="sortPrice"]:checked').value;
    if (orden === 'lower') {
        productosFiltradosActuales.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (orden === 'higher') {
        productosFiltradosActuales.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
    mostrarTarjetas(productosFiltradosActuales);
    configurarPaginacion(productosFiltradosActuales);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[name="sortPrice"]').forEach(input => {
        input.addEventListener('change', ordenarProductos);
    });
});

function filtrarProductosPorTienda() {
    const tiendasSeleccionadas = Array.from(document.querySelectorAll('input[name="filtroTienda"]:checked')).map(el => el.value);
    if (tiendasSeleccionadas.length > 0) {
        productosFiltradosActuales = todosLosProductos.filter(producto => tiendasSeleccionadas.includes(producto.storeName));
    } else {
        productosFiltradosActuales = todosLosProductos.slice();
    }
    configurarPaginacion(productosFiltradosActuales);
    mostrarTarjetas(productosFiltradosActuales);
    ordenarProductos();
}
