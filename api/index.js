const express = require('express');
const cors = require('cors');
const app = express();
const paypalRouter = require('./routes/paypal');

app.use(cors());
app.use(express.json());
const productosRouter = require('./routes/productos');
app.use('/api/productos', productosRouter);
app.use('/api/paypal', paypalRouter);
app.listen(3000, () => {
    console.log('Api corriendo en http://localhost:3000');
});