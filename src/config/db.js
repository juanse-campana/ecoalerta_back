import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carga las variables del archivo .env
dotenv.config();

// 1. Creamos el "pool" de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,      // El usuario 'ecoalerta_backend_usr'
  password: process.env.DB_PASSWORD,  // La contraseña segura
  database: process.env.DB_DATABASE,  // 'ecoalerta'
  waitForConnections: true,
  connectionLimit: 10, // Número de conexiones listas para usar
  queueLimit: 0
});

// 2. Hacemos una conexión de prueba para ver si todo está bien
pool.getConnection()
  .then(connection => {
    console.log('✅ Conectado exitosamente a la DB (pool)');
    connection.release(); // ¡Importante! Devuelve la conexión al pool
  })
  .catch(err => {
    console.error('❌ Error al conectar con la DB:', err.message);
  });

// 3. Exportamos el pool para que los "Servicios" lo usen
export default pool;