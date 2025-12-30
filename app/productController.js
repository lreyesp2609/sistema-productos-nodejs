const { sql } = require('./db');

// Crear producto
async function createProduct(nombre, cantidad, activo, usuarioId) {
    try {
        const result = await sql`
            INSERT INTO productos (nombre, cantidad, activo, usuario_id)
            VALUES (${nombre}, ${cantidad}, ${activo}, ${usuarioId})
            RETURNING *
        `;
        return { success: true, producto: result[0] };
    } catch (error) {
        console.error('Error al crear producto:', error);
        return { success: false, message: 'Error al crear el producto' };
    }
}

// Obtener todos los productos de un usuario
async function getProductsByUser(usuarioId) {
    try {
        const result = await sql`
            SELECT p.*, u.usuario as nombre_usuario
            FROM productos p
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.usuario_id = ${usuarioId}
            ORDER BY p.created_at DESC
        `;
        return { success: true, productos: result };
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return { success: false, message: 'Error al obtener productos' };
    }
}

// Obtener un producto por ID
async function getProductById(id, usuarioId) {
    try {
        const result = await sql`
            SELECT * FROM productos
            WHERE id = ${id} AND usuario_id = ${usuarioId}
        `;
        if (result.length === 0) {
            return { success: false, message: 'Producto no encontrado' };
        }
        return { success: true, producto: result[0] };
    } catch (error) {
        console.error('Error al obtener producto:', error);
        return { success: false, message: 'Error al obtener el producto' };
    }
}

// Actualizar producto
async function updateProduct(id, nombre, cantidad, activo, usuarioId) {
    try {
        const result = await sql`
            UPDATE productos
            SET nombre = ${nombre},
                cantidad = ${cantidad},
                activo = ${activo},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id} AND usuario_id = ${usuarioId}
            RETURNING *
        `;
        if (result.length === 0) {
            return { success: false, message: 'Producto no encontrado' };
        }
        return { success: true, producto: result[0] };
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        return { success: false, message: 'Error al actualizar el producto' };
    }
}

// Eliminar producto
async function deleteProduct(id, usuarioId) {
    try {
        const result = await sql`
            DELETE FROM productos
            WHERE id = ${id} AND usuario_id = ${usuarioId}
            RETURNING *
        `;
        if (result.length === 0) {
            return { success: false, message: 'Producto no encontrado' };
        }
        return { success: true, message: 'Producto eliminado correctamente' };
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        return { success: false, message: 'Error al eliminar el producto' };
    }
}

// Obtener estadísticas de productos por usuario
async function getProductStats(usuarioId) {
    try {
        const result = await sql`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN activo = true THEN 1 END) as activos,
                COUNT(CASE WHEN activo = false THEN 1 END) as inactivos,
                COALESCE(SUM(cantidad), 0) as cantidad_total
            FROM productos
            WHERE usuario_id = ${usuarioId}
        `;
        return { success: true, stats: result[0] };
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return { success: false, message: 'Error al obtener estadísticas' };
    }
}

module.exports = {
    createProduct,
    getProductsByUser,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductStats
};