import { createClient } from 'redis';

// 1. Crear el cliente
// Por defecto, 'createClient()' intenta conectarse a '127.0.0.1:6379'
// Si tu Redis está en otro lugar, lo pones aquí:
// const redisClient = createClient({ url: 'redis://user:pass@host:port' });
const redisClient = createClient();

// 2. Configurar manejadores de eventos (para saber qué pasa)
redisClient.on('error', (err) => {
  console.error('❌ Error de Redis Client:', err.message);
  // En un entorno de producción, podrías tener lógica para reintentar
});

redisClient.on('connect', () => {
  console.log('✅ Conectado exitosamente a Redis');
});

// 3. Iniciar la conexión
// El cliente de Redis v4 (moderno) es asíncrono.
// Usamos una IIFE (función que se autoejecuta) para conectarnos.
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('❌ No se pudo conectar a Redis al iniciar:', err.message);
  }
})();

// 4. Exportar el cliente (la conexión)
// Otros archivos importarán esta instancia ya conectada.
export default redisClient;