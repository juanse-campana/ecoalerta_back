/**
 * @name errorHandler
 * @description Middleware de Express para manejar todos los errores.
 * Atrapa los errores lanzados por los controladores (con next(error)).
 * ¡Debe ser el ÚLTIMO 'app.use()' en index.js!
 */
const errorHandler = (err, req, res, next) => {

  // 1. Registrar el error técnico completo en la consola del servidor.
  // Esto es para que TÚ (el desarrollador) puedas ver qué pasó.
  console.error(err.stack);

  // 2. Establecer un código de estado.
  // Si el error tiene un 'statusCode' (ej. 404), úsalo.
  // Si no, usa 500 (Error Interno del Servidor) como default.
  const statusCode = err.statusCode || 500;

  // 3. Preparar un mensaje amigable para el frontend.
  // Si el error tiene un 'message', úsalo.
  // Si no, da un mensaje genérico.
  const message = err.message || 'Ocurrió un error inesperado en el servidor';

  // 4. Enviar la respuesta JSON de error estandarizada.
  // El frontend siempre recibirá este formato.
  res.status(statusCode).json({
    status: 'error',
    message: message,
    
    // Opcional: Solo en modo 'development', podrías enviar el stack
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorHandler;