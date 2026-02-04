import pool from '../config/db.js';
import redisClient from '../config/redisClient.js';

// Definimos los nombres de nuestras "llaves" de caché
const PROVINCIAS_CACHE_KEY = 'catalogos:provincias';
const CATEGORIAS_CACHE_KEY = 'catalogos:categorias';

// Datos de respaldo (Fallback)
const FALLBACK_PROVINCIAS = [
  { id_provincia: 1, nombre: 'Loja' },
  { id_provincia: 2, nombre: 'Azuay' },
  { id_provincia: 3, nombre: 'Pichincha' },
  { id_provincia: 4, nombre: 'Guayas' }
];

const FALLBACK_CIUDADES = [
  { id_ciudad: 1, nombre: 'Loja', id_provincia: 1 },
  { id_ciudad: 2, nombre: 'Catamayo', id_provincia: 1 },
  { id_ciudad: 3, nombre: 'Saraguro', id_provincia: 1 },
  { id_ciudad: 4, nombre: 'Cuenca', id_provincia: 2 },
  { id_ciudad: 5, nombre: 'Gualaceo', id_provincia: 2 },
  { id_ciudad: 6, nombre: 'Quito', id_provincia: 3 },
  { id_ciudad: 7, nombre: 'Cayambe', id_provincia: 3 },
  { id_ciudad: 8, nombre: 'Guayaquil', id_provincia: 4 },
  { id_ciudad: 9, nombre: 'Samborondón', id_provincia: 4 }
];

const FALLBACK_CATEGORIAS = [
  { id_categoria: 1, nombre: 'fauna' },
  { id_categoria: 2, nombre: 'basura' },
  { id_categoria: 3, nombre: 'quema' },
  { id_categoria: 4, nombre: 'deforestacion' },
  { id_categoria: 5, nombre: 'contaminacion' },
  { id_categoria: 6, nombre: 'ruido' },
  { id_categoria: 7, nombre: 'aire' },
  { id_categoria: 8, nombre: 'infraestructura' }
];

export const findProvincias = async () => {
  try {
    const cachedData = await redisClient.get(PROVINCIAS_CACHE_KEY);
    if (cachedData) {
      console.log('CACHE HIT: Sirviendo provincias desde Redis');
      return JSON.parse(cachedData);
    }

    console.log('CACHE MISS: Buscando provincias en MySQL');
    const [rows] = await pool.query('SELECT * FROM provincias ORDER BY nombre ASC');

    const data = rows.length > 0 ? rows : FALLBACK_PROVINCIAS;

    await redisClient.set(PROVINCIAS_CACHE_KEY, JSON.stringify(data), { EX: 86400 });
    return data;

  } catch (error) {
    console.error("Using fallback for Provincias due to error:", error.message);
    return FALLBACK_PROVINCIAS;
  }
};

export const findCiudadesByProvincia = async (idProvincia) => {
  const CIUDADES_CACHE_KEY = `catalogos:ciudades:${idProvincia}`;

  try {
    const cachedData = await redisClient.get(CIUDADES_CACHE_KEY);
    if (cachedData) return JSON.parse(cachedData);

    console.log(`CACHE MISS: Buscando ciudades para provincia ${idProvincia} en MySQL`);
    const [rows] = await pool.query('SELECT * FROM ciudades WHERE id_provincia = ? ORDER BY nombre ASC', [idProvincia]);

    const data = rows.length > 0 ? rows : FALLBACK_CIUDADES.filter(c => c.id_provincia == idProvincia);

    await redisClient.set(CIUDADES_CACHE_KEY, JSON.stringify(data), { EX: 86400 });
    return data;

  } catch (error) {
    console.error("Using fallback for Ciudades due to error:", error.message);
    return FALLBACK_CIUDADES.filter(c => c.id_provincia == idProvincia);
  }
};

export const findCategorias = async () => {
  try {
    const cachedData = await redisClient.get(CATEGORIAS_CACHE_KEY);
    if (cachedData) return JSON.parse(cachedData);

    console.log('CACHE MISS: Buscando categorías en MySQL');
    const [rows] = await pool.query('SELECT * FROM categorias ORDER BY nombre ASC');

    const data = rows.length > 0 ? rows : FALLBACK_CATEGORIAS;

    await redisClient.set(CATEGORIAS_CACHE_KEY, JSON.stringify(data), { EX: 86400 });
    return data;

  } catch (error) {
    console.error("Using fallback for Categorias due to error:", error.message);
    return FALLBACK_CATEGORIAS;
  }
};