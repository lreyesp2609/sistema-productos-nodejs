const { sql } = require('../app/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function insertTestUser() {
    try {
        const usuario = 'admin';
        const passwordPlain = 'admin123';
        
        // Hashear la contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(passwordPlain, saltRounds);
        
        console.log('👤 Insertando usuario de prueba...');
        
        await sql`
            INSERT INTO usuarios (usuario, password)
            VALUES (${usuario}, ${passwordHash})
            ON CONFLICT (usuario) DO NOTHING
        `;
        
        console.log('✅ Usuario de prueba creado:');
        console.log('   Usuario: admin');
        console.log('   Contraseña: admin123');
        
        await sql.end();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error al insertar usuario:', error.message);
        process.exit(1);
    }
}

insertTestUser();