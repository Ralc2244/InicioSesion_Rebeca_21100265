const express = require('express');
const router = express.Router();
const axios = require('axios');

const CLIENT_ID = 'AXDHQfZrj4iNY0U7il7Z-r0bBQsKprkoV9VKXahlxPZ6NV6i_-6VLnd_oZgP2b3IICXY5Vak47oQPYuw';
const SECRET = 'EIvjCT3mpoyiHc85qi1-sCC-NcN1e8TXUAs3hXtPrCARIYDVhtb5_EKty_k4lMmwga669p-XGLzgBnUt';
const baseURL = 'https://api-m.sandbox.paypal.com'; // Cambia a live para producción

// Obtener token
async function getAccessToken() {
  const response = await axios({
    url: `${baseURL}/v1/oauth2/token`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      username: CLIENT_ID,
      password: SECRET,
    },
    data: 'grant_type=client_credentials',
  });
  return response.data.access_token;
}

// Crear orden
router.post('/create-order', async (req, res) => {
  const total = req.body.total; // Ej: 500.00

  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${baseURL}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'MXN',
              value: total.toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: 'http://localhost:4200/pago-completado', // Puedes cambiarlo
          cancel_url: 'http://localhost:4200/cancelado',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Redirige a PayPal
    const approveUrl = response.data.links.find(
      (link) => link.rel === 'approve'
    ).href;

    res.json({ url: approveUrl });
  } catch (error) {
    console.error('Error al crear orden:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al crear la orden de pago' });
  }
});

module.exports = router;
