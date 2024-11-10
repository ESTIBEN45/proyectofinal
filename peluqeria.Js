document.addEventListener("DOMContentLoaded", () => {
  const registrarCompraBtn = document.getElementById("registrarCompraBtn");
  const compraForm = document.getElementById("compraForm");

  if (registrarCompraBtn && compraForm) {
    registrarCompraBtn.addEventListener("click", () => {
      if (compraForm.checkValidity()) {
        window.location.href = "vista2.html";
      } else {
        compraForm.reportValidity();
      }
    });
  }

  const cancelarBtn = document.querySelector(
    ".nav-buttons button:nth-child(1)"
  );
  const completarBtn = document.querySelector(
    ".nav-buttons button:nth-child(2)"
  );

  if (cancelarBtn) cancelarBtn.addEventListener("click", cancelarCompra);
  if (completarBtn) completarBtn.addEventListener("click", completarCompra);

  const filtrarBtn = document.querySelector(
    "button[onclick='filtrarProductos()']"
  );
  const limpiarBtn = document.querySelector(
    "button[onclick='limpiarFiltros()']"
  );

  if (filtrarBtn) filtrarBtn.addEventListener("click", filtrarProductos);
  if (limpiarBtn) limpiarBtn.addEventListener("click", limpiarFiltros);

  mostrarCarrito();
  cargarProductos();
});

let categoriaSeleccionada = "todos";
let tipoSeleccionado = "todos";
let productosMostrados = 0;
const productosPorCarga = 5;
const presupuestoMaximo = 1000000000000000;

function cargarProductos() {
  const productosLista = document.getElementById("productosLista");
  if (!productosLista) return;

  const productosFiltrados = productos.filter((producto) => {
    return (
      (categoriaSeleccionada === "todos" ||
        producto.categoria === categoriaSeleccionada) &&
      (tipoSeleccionado === "todos" || producto.tipo === tipoSeleccionado)
    );
  });

  const productosParaMostrar = productosFiltrados.slice(
    productosMostrados,
    productosMostrados + productosPorCarga
  );

  if (productosParaMostrar.length === 0) {
    console.log("No hay más productos para cargar.");
    return;
  }

  productosParaMostrar.forEach((producto) => {
    const productoDiv = document.createElement("div");
    productoDiv.classList.add("producto");
    productoDiv.innerHTML = `
        <img src="${producto.foto}" alt="${producto.nombre}" class="producto-img">
        <h3>${producto.nombre}</h3>
        <p>Marca: ${producto.marca}</p>
        <p>Precio: $${producto.precio}</p>
        <button onclick="verDetalle(${producto.id})">Ver Detalle</button>
      `;
    productosLista.appendChild(productoDiv);
  });

  productosMostrados += productosPorCarga;
}

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 10) {
    cargarProductos();
  }
});

function verDetalle(id) {
  const producto = productos.find((p) => p.id === id);

  if (producto) {
    document.getElementById("detalleImagen").src = producto.foto;
    document.getElementById("detalleNombre").textContent = producto.nombre;
    document.getElementById("detalleNombre").dataset.id = producto.id;
    document.getElementById(
      "detallePrecio"
    ).textContent = `Precio: $${producto.precio.toFixed(2)}`;
    document.getElementById("detalleTipo").textContent = producto.tipo || "N/A";
    document.getElementById("detalleCategoria").textContent =
      producto.categoria || "N/A";

    const detalleProducto = document.getElementById("detalleProducto");
    detalleProducto.classList.remove("hidden");
    detalleProducto.classList.add("mostrar");
  } else {
    console.error(`Producto con id ${id} no encontrado.`);
  }
}

function cancelarCompra() {
  alert("La compra ha sido cancelada.");
  window.location.href = "index.html";
}

function completarCompra() {
  alert("Compra completada con éxito.");
  window.location.href = "vista3.html";
}

function filtrarProductos() {
  const categoriaSelect = document.getElementById("filtroCategoria");
  const tipoSelect = document.getElementById("filtroTipo");

  categoriaSeleccionada = categoriaSelect.value;
  tipoSeleccionado = tipoSelect.value;

  productosMostrados = 0;
  document.getElementById("productosLista").innerHTML = "";

  cargarProductos();
}

function limpiarFiltros() {
  categoriaSeleccionada = "todos";
  tipoSeleccionado = "todos";

  document.getElementById("filtroCategoria").value = "todos";
  document.getElementById("filtroTipo").value = "todos";

  productosMostrados = 0;
  document.getElementById("productosLista").innerHTML = "";

  cargarProductos();
}

function mostrarCarrito() {
  const carritoLista = document.getElementById("carritoLista");
  if (!carritoLista) return;

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carritoLista.innerHTML = "";

  if (carrito.length === 0) {
    carritoLista.innerHTML =
      "<tr><td colspan='7'>El carrito está vacío.</td></tr>";
    actualizarResumenCompra();
    return;
  }

  carrito.forEach((item, index) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td>${item.nombre}</td>
        <td>${item.tipo}</td>
        <td>${item.categoria}</td>
        <td>${item.cantidad}</td>
        <td>$${item.precio.toFixed(2)}</td>
        <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
        <td><button onclick="eliminarDelCarrito(${index})">Eliminar</button></td>
      `;
    carritoLista.appendChild(fila);
  });

  actualizarResumenCompra();
}

function agregarAlCarrito() {
  const nombreProducto = document.getElementById("detalleNombre").textContent;
  const tipoProducto =
    document.getElementById("detalleTipo").textContent || "N/A";
  const categoriaProducto =
    document.getElementById("detalleCategoria").textContent || "N/A";
  const precioProducto = parseFloat(
    document
      .getElementById("detallePrecio")
      .textContent.replace("Precio: $", "")
  );
  const cantidad = parseInt(document.getElementById("cantidadProducto").value);

  const producto = {
    nombre: nombreProducto,
    tipo: tipoProducto,
    categoria: categoriaProducto,
    precio: precioProducto,
    cantidad,
  };

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.push(producto);
  localStorage.setItem("carrito", JSON.stringify(carrito));

  alert(`Producto ${nombreProducto} agregado al carrito.`);
  mostrarCarrito();

  const detalleProducto = document.getElementById("detalleProducto");
  detalleProducto.classList.remove("mostrar");
  detalleProducto.classList.add("hidden");
}

function actualizarResumenCompra() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  let totalProductos = 0;
  let subtotal = 0;

  carrito.forEach((item) => {
    totalProductos += item.cantidad;
    subtotal += item.precio * item.cantidad;
  });

  const cargoDomicilio = subtotal < 50 ? 15000 : 0;
  const totalCompra = subtotal + cargoDomicilio;

  document.getElementById("totalProductos").textContent = totalProductos;
  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("cargoDomicilio").textContent =
    cargoDomicilio.toFixed(2);
  document.getElementById("totalCompra").textContent = totalCompra.toFixed(2);
}

function eliminarDelCarrito(index) {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));

  mostrarCarrito();
}

let compraEnProgreso = false;

function validarYCompletarCompra() {
  if (compraEnProgreso) {
    alert("Hay una compra en progreso, por favor espere.");
    return;
  }

  const numeroTarjeta = document.getElementById("numeroTarjeta").value;
  const nombreTitular = document.getElementById("nombreTitular").value;
  const fechaExpiracion = document.getElementById("fechaExpiracion").value;
  const cvv = document.getElementById("cvv").value;
  const paisEmision = document.getElementById("paisEmision").value;
  const tipoTarjeta = document.getElementById("tipoTarjeta").value;

  if (
    !numeroTarjeta ||
    !nombreTitular ||
    !fechaExpiracion ||
    !cvv ||
    !paisEmision ||
    !tipoTarjeta
  ) {
    alert("Por favor, completa todos los campos de la tarjeta.");
    return;
  }

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const cantidadProductos = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  if (cantidadProductos > 20) {
    alert("La cantidad de productos no debe ser mayor a 20.");
    return;
  }

  const totalCompra = parseFloat(
    document.getElementById("totalCompra").textContent
  );

  if (totalCompra > presupuestoMaximo) {
    alert("El presupuesto máximo ha sido superado.");
    return;
  }

  compraEnProgreso = true;
  const delay = Math.random() * 1000 + 2000;

  setTimeout(() => {
    compraEnProgreso = false;

    if (Math.random() > 0.5) {
      alert("Pago realizado con éxito. Redirigiendo...");
      window.location.href = "index.html";
    } else {
      alert("Error al procesar el pago. Por favor, intente nuevamente.");
    }
  }, delay);
}

document.getElementById("confirmarCompraBtn").addEventListener("click", () => {
  validarYCompletarCompra();
});
