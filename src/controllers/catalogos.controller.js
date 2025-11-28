import {
  findProvincias,
  findCiudadesByProvincia,
  findCategorias
} from '../services/catalogo.service.js';

/**
 * @name getProvincias
 * @description Mesero (Controlador) para manejar la petición de todas las provincias.
 */
export const getProvincias = async (req, res, next) => {
  try {
    // 1. Llama al Chef (Servicio) que sabe cómo buscar provincias
    const provincias = await findProvincias();

    // 2. Entrega la comida (respuesta) al cliente
    res.json(provincias);

  } catch (error) {
    // 3. Si algo sale mal, llama al Director de Hospital (ErrorHandler)
    next(error);
  }
};

/**
 * @name getCiudadesByProvincia
 * @description Mesero (Controlador) para manejar la petición de ciudades filtradas.
 */
export const getCiudadesByProvincia = async (req, res, next) => {
  try {
    // 1. Busca el filtro en req.query (lo que viene después de '?')
    const { id_provincia } = req.query;

    // 2. Validación: Si no mandan el filtro, es un error.
    if (!id_provincia) {
      return res.status(400).json({
        status: 'error',
        message: 'El id_provincia es requerido en los query params (ej: ?id_provincia=12)'
      });
    }

    // 3. Llama al Chef (Servicio) pasándole el filtro
    const ciudades = await findCiudadesByProvincia(id_provincia);

    // 4. Entrega la comida (respuesta) al cliente
    res.json(ciudades);

  } catch (error) {
    // 5. Si algo sale mal, llama al Director de Hospital
    next(error);
  }
};

/**
 * @name getCategorias
 * @description Mesero (Controlador) para manejar la petición de todas las categorías.
 */
export const getCategorias = async (req, res, next) => {
  try {
    // 1. Llama al Chef (Servicio)
    const categorias = await findCategorias();

    // 2. Entrega la comida (respuesta) al cliente
    res.json(categorias);

  } catch (error) {
    // 3. Si algo sale mal, llama al Director de Hospital
    next(error);
  }
};