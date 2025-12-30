const { sql } = require('../app/db');
require('dotenv').config();

async function createProductsTable() {
    try {
        console.log('🔨 Creando tabla de productos...');
        
        // Crear tabla productos
        await sql`
            CREATE TABLE IF NOT EXISTS productos (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                cantidad INTEGER NOT NULL DEFAULT 0,
                activo BOOLEAN DEFAULT true,
                usuario_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            )
        `;
        
        console.log('✅ Tabla "productos" creada exitosamente');
        console.log('📋 Estructura:');
        console.log('   - id: Identificador único');
        console.log('   - nombre: Nombre del producto');
        console.log('   - cantidad: Cantidad de productos');
        console.log('   - activo: Estado (activo/inactivo)');
        console.log('   - usuario_id: ID del usuario que creó el producto');
        console.log('   - created_at: Fecha de creación');
        console.log('   - updated_at: Fecha de última actualización');
        
        // Cerrar conexión
        await sql.end();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error al crear tabla:', error.message);
        process.exit(1);
    }
}

createProductsTable();