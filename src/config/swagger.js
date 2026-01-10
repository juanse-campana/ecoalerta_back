import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoAlerta Loja API',
      version: '1.0.0',
      description: 'API del backend para la aplicación EcoAlerta Loja',
    },
    servers: [
      {
        url: 'http://localhost:4000/api',
        description: 'Servidor de Desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Archivos donde buscar anotaciones
};

const specs = swaggerJsdoc(options);
export default specs;
