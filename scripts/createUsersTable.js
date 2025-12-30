const { sql } = require('../app/db');
require('dotenv').config();

async function createUsersTable() {
    try {
        console.log('🔨 Creando tabla de usuarios...');
        
        // Crear tabla usuarios
        await sql`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                usuario VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        console.log('✅ Tabla "usuarios" creada exitosamente');
        
        // Cerrar conexión
        await sql.end();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error al crear tabla:', error.message);
        process.exit(1);
    }
}

createUsersTable();