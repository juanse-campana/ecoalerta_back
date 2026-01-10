import { Router } from 'express';
import {
  getProvincias,
  getCiudadesByProvincia,
  getCategorias
} from '../controllers/catalogsController.js';

const router = Router();

/**
 * @swagger
 * /catalogos/provincias:
 *   get:
 *     summary: Obtener todas las provincias
 *     tags: [Catálogos]
 *     responses:
 *       200:
 *         description: Lista de provincias
 */
// GET /api/catalogos/provincias
router.get('/provincias', getProvincias);

/**
 * @swagger
 * /catalogos/ciudades:
 *   get:
 *     summary: Obtener ciudades (filtrar por id_provincia)
 *     tags: [Catálogos]
 *     parameters:
 *       - in: query
 *         name: id_provincia
 *         schema:
 *           type: integer
 *         description: ID de la provincia para filtrar
 *     responses:
 *       200:
 *         description: Lista de ciudades
 */
// GET /api/catalogos/ciudades
router.get('/ciudades', getCiudadesByProvincia);

/**
 * @swagger
 * /catalogos/categorias:
 *   get:
 *     summary: Obtener todas las categorías de reportes
 *     tags: [Catálogos]
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
// GET /api/catalogos/categorias
router.get('/categorias', getCategorias);

export default router;