import { verifyToken } from '../utils/jwt.js';
import pool from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Opcional: Si la ruta permite acceso público, esto debería manejarse antes o usar un middleware 'optionalAuth'
      // Aquí asumimos que si se usa 'authenticate', el token es obligatorio.
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Verificar que el usuario existe y no está eliminado
    // Usamos id_usr directamente como string/int según el modelo User
    const [users] = await pool.query(
      `SELECT id_usr, nombre, apellido, correo, rol, id_ciudad
       FROM Usuarios 
       WHERE id_usr = ?`,
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Agregar usuario a la request
    req.user = users[0];
    req.user.id = users[0].id_usr; // Alias para consistencia
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación'
    });
  }
};

// Middleware para verificar roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    // Normalizar rol a minúsculas por si acaso
    const userRole = req.user.rol ? req.user.rol.toLowerCase() : '';

    // Check if any of the required roles matches (case insensitive check usually better)
    // Assuming 'roles' arg strings are also standard casing
    if (!roles.includes(req.user.rol)) {
      // Also try matching loosely if needed, currently strict
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};