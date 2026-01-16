const { verifyToken } = require('../utils/jwt');
const db = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
<<<<<<< Updated upstream
    const [users] = await db.execute(
      `SELECT BIN_TO_UUID(id_usr_bin) as id, nombre, apellido, correo, rol, id_ciudad
       FROM Usuarios 
       WHERE BIN_TO_UUID(id_usr_bin) = ? AND deleted_at IS NULL`,
=======
    // decoded.id debe ser un UUID string si generamos el token con UUID string.
    // Pero en el modelo User.js usamos BIN_TO_UUID, asi que 'id' es string.
    // La query necesita UUID_TO_BIN para comparar
    const [users] = await pool.query(
      `SELECT id_usr as id, nombre, apellido, correo, rol, id_ciudad
       FROM Usuarios 
       WHERE id_usr = ?`,
>>>>>>> Stashed changes
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
    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación'
    });
  }
};

// Middleware para verificar roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };