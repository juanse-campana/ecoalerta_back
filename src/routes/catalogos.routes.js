import { Router } from 'express';
import {
  getProvincias,
  getCiudadesByProvincia,
  getCategorias
} from '../controllers/catalogsController.js';

const router = Router();

// GET /api/catalogos/provincias
// (Obtiene todas las provincias)
router.get('/provincias', getProvincias);

// GET /api/catalogos/ciudades
// (Obtiene ciudades, filtradas por un query parameter)
// Petición de ejemplo: /api/catalogos/ciudades?id_provincia=12
router.get('/ciudades', getCiudadesByProvincia);

// GET /api/catalogos/categorias
// (Obtiene todas las categorías de reportes)
router.get('/categorias', getCategorias);

export default router;