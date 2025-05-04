// db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tiendita',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Exporta el pool CON promesas
module.exports = pool.promise();