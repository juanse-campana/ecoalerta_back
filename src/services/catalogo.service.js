import pool from '../config/db.js';
import redisClient from '../config/redisClient.js';

// Definimos los nombres de nuestras "llaves" de caché
const PROVINCIAS_CACHE_KEY = 'catalogos:provincias';
const CATEGORIAS_CACHE_KEY = 'catalogos:categorias';
// Nota: La llave de ciudades debe ser dinámica

/**
 * @name findProvincias
 * @description Chef (Servicio) para buscar todas las provincias.
 * Primero intenta buscar en el caché de Redis.
 */
export const findProvincias = async () => {
  try {
    // 1. Intentar obtener de Redis
    const cachedData = await redisClient.get(PROVINCIAS_CACHE_KEY);

    if (cachedData) {
      console.log('CACHE HIT: Sirviendo provincias desde Redis');
      return JSON.parse(cachedData); // Devolver datos de caché
    }

    // 2. Si no está en caché (Cache MISS), ir a MySQL
    console.log('CACHE MISS: Buscando provincias en MySQL');
    const [rows] = await pool.query('SELECT * FROM Provincias ORDER BY nombre ASC');

    // 3. Guardar en Redis para la próxima vez (con expiración de 1 día)
    await redisClient.set(PROVINCIAS_CACHE_KEY, JSON.stringify(rows), {
      EX: 86400, // 86400 segundos = 1 día
    });

    return rows; // Devolver datos de la DB

  } catch (error) {
    // Si algo falla, lanza el error para que el controlador lo atrape
    throw new Error('Error al buscar provincias: ' + error.message);
  }
};

/**
 * @name findCiudadesByProvincia
 * @description Chef (Servicio) para buscar ciudades por un id_provincia.
 * Usa un caché dinámico basado en el ID.
 */
export const findCiudadesByProvincia = async (idProvincia) => {
  // Creamos una llave de caché única para esta provincia
  const CIUDADES_CACHE_KEY = `catalogos:ciudades:${idProvincia}`;

  try {
    // 1. Intentar obtener de Redis
    const cachedData = await redisClient.get(CIUDADES_CACHE_KEY);

    if (cachedData) {
      console.log(`CACHE HIT: Sirviendo ciudades para provincia ${idProvincia} desde Redis`);
      return JSON.parse(cachedData);
    }

    // 2. Si no está en caché (Cache MISS), ir a MySQL
    console.log(`CACHE MISS: Buscando ciudades para provincia ${idProvincia} en MySQL`);
    
    // ¡Usamos '?' para prevenir Inyección SQL!
    const query = 'SELECT * FROM Ciudades WHERE id_provincia = ? ORDER BY nombre ASC';
    const [rows] = await pool.query(query, [idProvincia]);

    // 3. Guardar en Redis (expiración de 1 día)
    await redisClient.set(CIUDADES_CACHE_KEY, JSON.stringify(rows), {
      EX: 86400,
    });

    return rows; // Devolver datos de la DB

  } catch (error) {
    throw new Error('Error al buscar ciudades: ' + error.message);
  }
};

/**
 * @name findCategorias
 * @description Chef (Servicio) para buscar todas las categorías.
 * Primero intenta buscar en el caché de Redis.
 */
export const findCategorias = async () => {
  try {
    // 1. Intentar obtener de Redis
    const cachedData = await redisClient.get(CATEGORIAS_CACHE_KEY);

    if (cachedData) {
      console.log('CACHE HIT: Sirviendo categorías desde Redis');
      return JSON.parse(cachedData);
    }

    // 2. Si no está en caché (Cache MISS), ir a MySQL
    console.log('CACHE MISS: Buscando categorías en MySQL');
    const [rows] = await pool.query('SELECT * FROM Categorias ORDER BY nombre ASC');

    // 3. Guardar en Redis (expiración de 1 día)
    await redisClient.set(CATEGORIAS_CACHE_KEY, JSON.stringify(rows), {
      EX: 86400,
    });

    return rows; // Devolver datos de la DB

  } catch (error) {
    throw new Error('Error al buscar categorías: ' + error.message);
  }
};