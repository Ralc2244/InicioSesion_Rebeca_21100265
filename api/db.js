// db.js
const mysql = require('mysql2');

// Configuración de la base de datos (valores definidos directamente en el código)
const dbConfig = {
  host: 'localhost', // Dirección del servidor MySQL
  user: 'root',      // Usuario para la base de datos
  password: '',      // Contraseña para el usuario (deja vacío si no la tienes)
  database: 'tiendita', // Nombre de la base de datos
  waitForConnections: true,
  connectionLimit: 10, // Número máximo de conexiones
  queueLimit: 0,
  timezone: 'local',
  charset: 'utf8mb4',
  multipleStatements: false,
  connectTimeout: 10000, // Tiempo de espera para la conexión (10 segundos)
  decimalNumbers: true
};

// Crear el pool de conexiones
const pool = mysql.createPool(dbConfig);

// Configurar promesas
const promisePool = pool.promise();

// Verificar la conexión al iniciar
async function verifyConnection() {
  try {
    const [rows] = await promisePool.query('SELECT 1 + 1 AS result');
    console.log('Conexión a MySQL establecida correctamente');
    console.debug(`Resultado prueba: ${rows[0].result}`);
  } catch (error) {
    console.error('Error al conectar a MySQL:', error.message);
    process.exit(1); // Salir si no hay conexión a la base de datos
  }
}

// Ejecutar verificación al cargar el módulo
verifyConnection();

// Manejador de eventos para el pool
pool.on('connection', (connection) => {
  console.debug('Nueva conexión establecida con MySQL');
});

pool.on('acquire', (connection) => {
  console.log('Conexión adquirida del pool');
});

pool.on('release', (connection) => {
  console.log('Conexión liberada al pool');
});

pool.on('enqueue', () => {
  console.warn('Solicitud de conexión en cola (todas las conexiones en uso)');
});

// Exportar el pool con promesas y funciones adicionales
module.exports = {
  pool: promisePool,
  raw: pool, // Para acceso al pool original si se necesita
  close: async () => {
    try {
      await pool.end();
      console.log('Pool de MySQL cerrado correctamente');
    } catch (error) {
      console.error('Error al cerrar el pool de MySQL:', error);
    }
  },
  ping: async () => {
    try {
      await promisePool.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Error al hacer ping a MySQL:', error);
      return false;
    }
  }
};
