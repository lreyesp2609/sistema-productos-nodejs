const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const { sql, testConnection } = require('./app/db');
const {
    createProduct,
    getProductsByUser,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductStats
} = require('./app/productController');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Ruta de login
app.post('/login', async (req, res) => {
    const { usuario, password } = req.body;
    
    try {
        // Buscar usuario en la BD
        const result = await sql`
            SELECT * FROM usuarios 
            WHERE usuario = ${usuario}
        `;
        
        if (result.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }
        
        const user = result[0];
        
        // Comparar contraseña hasheada
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Contraseña incorrecta' 
            });
        }
        
        // Login exitoso
        res.json({ 
            success: true, 
            message: '¡Bienvenido!',
            usuario: user.usuario,
            usuarioId: user.id
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor' 
        });
    }
});

// ==================== RUTAS DE PRODUCTOS (CRUD) ====================

// Obtener estadísticas de productos (DEBE IR ANTES de /:id)
app.get('/api/productos/stats/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    
    if (!usuarioId || isNaN(usuarioId)) {
        return res.status(400).json({
            success: false,
            message: 'Usuario ID inválido'
        });
    }
    
    const result = await getProductStats(parseInt(usuarioId));
    
    if (result.success) {
        res.json(result);
    } else {
        res.status(500).json(result);
    }
});

// Obtener todos los productos de un usuario
app.get('/api/productos/user/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    
    if (!usuarioId || isNaN(usuarioId)) {
        return res.status(400).json({
            success: false,
            message: 'Usuario ID inválido'
        });
    }
    
    const result = await getProductsByUser(parseInt(usuarioId));
    
    if (result.success) {
        res.json(result);
    } else {
        res.status(500).json(result);
    }
});

// Crear producto
app.post('/api/productos', async (req, res) => {
    const { nombre, cantidad, activo, usuarioId } = req.body;
    
    // Validaciones
    if (!nombre || cantidad === undefined || usuarioId === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Faltan datos requeridos'
        });
    }
    
    if (isNaN(usuarioId) || isNaN(cantidad)) {
        return res.status(400).json({
            success: false,
            message: 'Datos inválidos'
        });
    }
    
    const result = await createProduct(
        nombre, 
        parseInt(cantidad), 
        activo !== false, // default true si no se envía
        parseInt(usuarioId)
    );
    
    if (result.success) {
        res.status(201).json(result);
    } else {
        res.status(500).json(result);
    }
});

// Obtener un producto por ID
app.get('/api/productos/:id/:usuarioId', async (req, res) => {
    const { id, usuarioId } = req.params;
    
    if (isNaN(id) || isNaN(usuarioId)) {
        return res.status(400).json({
            success: false,
            message: 'IDs inválidos'
        });
    }
    
    const result = await getProductById(parseInt(id), parseInt(usuarioId));
    
    if (result.success) {
        res.json(result);
    } else {
        res.status(404).json(result);
    }
});

// Actualizar producto
app.put('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, cantidad, activo, usuarioId } = req.body;
    
    // Validaciones
    if (!nombre || cantidad === undefined || activo === undefined || !usuarioId) {
        return res.status(400).json({
            success: false,
            message: 'Faltan datos requeridos'
        });
    }
    
    if (isNaN(id) || isNaN(cantidad) || isNaN(usuarioId)) {
        return res.status(400).json({
            success: false,
            message: 'Datos inválidos'
        });
    }
    
    const result = await updateProduct(
        parseInt(id),
        nombre,
        parseInt(cantidad),
        activo,
        parseInt(usuarioId)
    );
    
    if (result.success) {
        res.json(result);
    } else {
        res.status(404).json(result);
    }
});

// Eliminar producto
app.delete('/api/productos/:id/:usuarioId', async (req, res) => {
    const { id, usuarioId } = req.params;
    
    if (isNaN(id) || isNaN(usuarioId)) {
        return res.status(400).json({
            success: false,
            message: 'IDs inválidos'
        });
    }
    
    const result = await deleteProduct(parseInt(id), parseInt(usuarioId));
    
    if (result.success) {
        res.json(result);
    } else {
        res.status(404).json(result);
    }
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, async () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log('🔌 Probando conexión a la base de datos...');
    await testConnection();
    console.log('');
    console.log('📋 Rutas API disponibles:');
    console.log('   POST   /login');
    console.log('   GET    /api/productos/stats/:usuarioId');
    console.log('   GET    /api/productos/user/:usuarioId');
    console.log('   POST   /api/productos');
    console.log('   GET    /api/productos/:id/:usuarioId');
    console.log('   PUT    /api/productos/:id');
    console.log('   DELETE /api/productos/:id/:usuarioId');
});