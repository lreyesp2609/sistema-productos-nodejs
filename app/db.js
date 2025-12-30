const postgres = require('postgres');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

// Función para probar la conexión
async function testConnection() {
    try {
        const result = await sql`SELECT NOW()`;
        console.log('✅ Conexión exitosa a la base de datos');
        console.log('⏰ Hora del servidor:', result[0].now);
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error.message);
        return false;
    }
}

module.exports = { sql, testConnection };