const express = require('express');
const cors = require('cors');
const app = express();
const paypalRouter = require('./routes/paypal');
const productosRouter = require('./routes/productos');

app.use(express.json()); // Para parsear el body en las peticiones POST
app.use(cors()); // Permite solicitudes CORS

// Rutas
app.use('/api/paypal', paypalRouter);
app.use('/api/productos', productosRouter);

// Solo una vez se debe llamar a `app.listen`:
app.listen(3000, () => {
    console.log('API corriendo en http://localhost:3000');
});
