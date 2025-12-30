// Verificar si el usuario está logueado
const usuario = localStorage.getItem('usuario');
const usuarioId = parseInt(localStorage.getItem('usuarioId'));

if (!usuario || !usuarioId || isNaN(usuarioId)) {
    // Si no hay usuario, redirigir al login
    console.error('No hay sesión válida');
    window.location.href = '/';
} else {
    // Mostrar nombre de usuario
    document.getElementById('username').textContent = usuario;
    document.getElementById('welcomeUser').textContent = usuario;
    
    // Mostrar inicial del usuario en el avatar
    const inicial = usuario.charAt(0).toUpperCase();
    document.getElementById('userInitial').textContent = inicial;
    
    console.log('Usuario ID:', usuarioId); // Para debug
}

// Mostrar fecha actual
const fecha = new Date();
const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById('currentDate').textContent = fecha.toLocaleDateString('es-ES', opciones);

// ==================== NAVEGACIÓN ENTRE VISTAS ====================

const dashboardView = document.getElementById('dashboardView');
const agregarProductoView = document.getElementById('agregarProductoView');
const verProductosView = document.getElementById('verProductosView');
const pageTitle = document.getElementById('pageTitle');

function mostrarVista(vista) {
    // Ocultar todas las vistas
    dashboardView.style.display = 'none';
    agregarProductoView.style.display = 'none';
    verProductosView.style.display = 'none';
    
    // Mostrar la vista seleccionada
    vista.style.display = 'block';
}

// Botón Dashboard
document.getElementById('btnDashboard').addEventListener('click', function() {
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    mostrarVista(dashboardView);
    pageTitle.textContent = 'Bienvenido al Dashboard';
    cargarEstadisticas();
});

// Botón Agregar Productos
document.getElementById('btnAgregarProductos').addEventListener('click', function() {
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    mostrarVista(agregarProductoView);
    pageTitle.textContent = 'Agregar Producto';
});

// Botón Ver Productos
document.getElementById('btnVerProductos').addEventListener('click', function() {
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    mostrarVista(verProductosView);
    pageTitle.textContent = 'Mis Productos';
    cargarProductos();
});

// Botón Cancelar
document.getElementById('btnCancelar').addEventListener('click', function() {
    document.getElementById('formAgregarProducto').reset();
    document.getElementById('btnDashboard').click();
});

// ==================== AGREGAR PRODUCTO ====================

document.getElementById('formAgregarProducto').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombreProducto').value.trim();
    const cantidad = parseInt(document.getElementById('cantidadProducto').value);
    const activo = document.getElementById('activoProducto').checked;
    const btnSubmit = this.querySelector('button[type="submit"]');
    
    // Validación
    if (!nombre || cantidad < 0) {
        alert('❌ Por favor completa todos los campos correctamente');
        return;
    }
    
    // Deshabilitar botón
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="icon">⏳</span> Guardando...';
    
    try {
        const response = await fetch('/api/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre,
                cantidad,
                activo,
                usuarioId: usuarioId // Ya es un número
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Producto agregado exitosamente');
            this.reset();
            document.getElementById('activoProducto').checked = true;
            
            // Actualizar estadísticas
            cargarEstadisticas();
            
            // Ir a la vista del dashboard
            document.getElementById('btnDashboard').click();
        } else {
            alert('❌ ' + data.message);
        }
        
    } catch (error) {
        alert('❌ Error al conectar con el servidor');
        console.error('Error:', error);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<span class="icon">💾</span> Guardar Producto';
    }
});

// ==================== CARGAR ESTADÍSTICAS ====================

async function cargarEstadisticas() {
    try {
        const response = await fetch(`/api/productos/stats/${usuarioId}`);
        const data = await response.json();
        
        if (data.success) {
            const stats = data.stats;
            document.getElementById('totalProductos').textContent = stats.total || 0;
            document.getElementById('productosActivos').textContent = stats.activos || 0;
            document.getElementById('productosInactivos').textContent = stats.inactivos || 0;
            document.getElementById('cantidadTotal').textContent = stats.cantidad_total || 0;
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// ==================== CARGAR PRODUCTOS ====================

async function cargarProductos() {
    const listaProductos = document.getElementById('listaProductos');
    listaProductos.innerHTML = '<p style="text-align: center; padding: 20px;">Cargando productos...</p>';
    
    try {
        const response = await fetch(`/api/productos/user/${usuarioId}`);
        const data = await response.json();
        
        if (data.success) {
            const productos = data.productos;
            
            if (productos.length === 0) {
                listaProductos.innerHTML = `
                    <div class="empty-state">
                        <div class="icon">📦</div>
                        <p>No tienes productos registrados</p>
                        <p style="font-size: 14px; margin-top: 10px;">Haz clic en "Agregar Productos" para comenzar</p>
                    </div>
                `;
                return;
            }
            
            listaProductos.innerHTML = productos.map(producto => `
                <div class="producto-card">
                    <div class="producto-info">
                        <h3>${producto.nombre}</h3>
                        <div class="producto-details">
                            <span>📊 Cantidad: <strong>${producto.cantidad}</strong></span>
                            <span class="producto-badge ${producto.activo ? 'activo' : 'inactivo'}">
                                ${producto.activo ? '✅ Activo' : '⏸️ Inactivo'}
                            </span>
                        </div>
                    </div>
                    <div class="producto-actions">
                        <button class="btn-icon btn-edit" onclick="editarProducto(${producto.id})" title="Editar">
                            ✏️
                        </button>
                        <button class="btn-icon btn-delete" onclick="eliminarProducto(${producto.id}, '${producto.nombre}')" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        listaProductos.innerHTML = '<p style="text-align: center; color: red;">❌ Error al cargar productos</p>';
    }
}

// ==================== ELIMINAR PRODUCTO ====================

async function eliminarProducto(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/productos/${id}/${usuarioId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Producto eliminado correctamente');
            cargarProductos();
            cargarEstadisticas();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        alert('❌ Error al eliminar el producto');
        console.error('Error:', error);
    }
}

// ==================== EDITAR PRODUCTO (Próximamente) ====================

function editarProducto(id) {
    alert('🔧 Funcionalidad de edición - Próximamente...');
    // Aquí puedes implementar la funcionalidad de editar
}

// Botón de refrescar productos
document.getElementById('btnRefrescar').addEventListener('click', function() {
    cargarProductos();
});

// Botón de Cerrar Sesión
document.getElementById('btnLogout').addEventListener('click', function() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        localStorage.removeItem('usuario');
        localStorage.removeItem('usuarioId');
        window.location.href = '/';
    }
});

// Cargar estadísticas al inicio
cargarEstadisticas();