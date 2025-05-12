const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const productosRouter = require('./routes/productos');
const paypalRouter = require('./routes/paypal');  // Mantener ruta de Paypal
const cors = require('cors');

// Configuración inicial
const app = express();
const PORT = 3000; // Puerto en el que se ejecuta la app (sin necesidad de usar variables de entorno)
const ENVIRONMENT = 'development'; // Establecemos el entorno manualmente, ya que no usas variables de entorno

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP
  message: 'Demasiadas peticiones desde esta IP, por favor intenta más tarde'
});

// Middlewares generales
app.use(cors());  // Habilitar CORS para todas las rutas
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(ENVIRONMENT === 'development' ? 'dev' : 'combined')); // Registra las peticiones HTTP

// Aplicar el middleware de rate limiting
app.use(limiter);

// Rutas principales
app.use('/api/paypal', paypalRouter);  // Ruta de Paypal
app.use('/api/productos', productosRouter);  // Ruta para productos

// Ruta de salud
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    environment: ENVIRONMENT,
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo centralizado de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  const statusCode = err.statusCode || 500;
  const message = ENVIRONMENT === 'production'
    ? 'Ocurrió un error en el servidor'
    : err.message;

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(ENVIRONMENT === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Entorno: ${ENVIRONMENT}`);
});

// Manejo de cierre elegante
process.on('SIGTERM', () => {
  console.log('Recibido SIGTERM. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Recibido SIGINT. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

module.exports = server;
