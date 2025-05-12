const express = require('express');
const router = express.Router();
const axios = require('axios');

// Configuración (deberían ser variables de entorno en producción)
const CLIENT_ID = 'AdF8qiECkFrIXtYJBzfWXyyvI2uHOp2T11yFMJjM7tcwu2wEx9B4sMpmqUse_0wFEhewG-6vSQr-iQsB';
const SECRET = 'ECj1NH98BoseWQnBnL_zQpNIvbIcSB0pfYKt4D7-L7ULQr5Sp9Us1YQpM7kSwI5C-6pHVAScyJuHiGyr';
const baseURL = 'https://api-m.sandbox.paypal.com'; // Cambiar a 'https://api-m.paypal.com' para producción

// Middleware para manejar errores de PayPal
const handlePayPalError = (error, res) => {
  console.error('Error en PayPal API:', error.response?.data || error.message);
  return res.status(500).json({ 
    error: 'Error en el procesamiento de PayPal',
    details: error.response?.data || error.message
  });
};

// Obtener token de acceso con caché básico
let accessToken = null;
let tokenExpiration = 0;

async function getAccessToken() {
  // Reutilizar token si aún es válido
  if (accessToken && Date.now() < tokenExpiration) {
    return accessToken;
  }

  try {
    const response = await axios({
      url: `${baseURL}/v1/oauth2/token`,
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      auth: {
        username: CLIENT_ID,
        password: SECRET,
      },
      data: 'grant_type=client_credentials',
    });

    accessToken = response.data.access_token;
    // Establecer expiración 5 minutos antes del tiempo real para evitar errores
    tokenExpiration = Date.now() + (response.data.expires_in * 1000) - 300000;
    
    return accessToken;
  } catch (error) {
    console.error('Error al obtener token de acceso:', error.response?.data || error.message);
    throw error;
  }
}

// Crear orden de pago
router.post('/create-order', async (req, res) => {
  const { total, returnUrl, cancelUrl } = req.body;

  if (!total || isNaN(total)) {
    return res.status(400).json({ error: 'Monto total inválido o faltante' });
  }

  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${baseURL}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'MXN',
            value: parseFloat(total).toFixed(2),
          },
        }],
        application_context: {
          return_url: returnUrl || 'http://localhost:4200/pago-completado',
          cancel_url: cancelUrl || 'http://localhost:4200/cancelado',
          brand_name: 'Tu Marca', // Personaliza el nombre que aparece en PayPal
          user_action: 'PAY_NOW', // Muestra el botón "Pagar ahora" directamente
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Prefer': 'return=representation', // Obtener más detalles en la respuesta
        },
      }
    );

    const approveUrl = response.data.links.find(link => link.rel === 'approve')?.href;
    
    if (!approveUrl) {
      throw new Error('No se encontró URL de aprobación en la respuesta de PayPal');
    }

    res.json({ 
      id: response.data.id, // ID de la orden para referencia futura
      url: approveUrl,
      status: response.data.status,
      details: response.data // Todos los detalles por si los necesitas
    });
  } catch (error) {
    handlePayPalError(error, res);
  }
});

// Ruta para verificar el estado de un pago
router.get('/check-payment/:orderId', async (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    return res.status(400).json({ error: 'ID de orden faltante' });
  }

  try {
    const accessToken = await getAccessToken();

    const response = await axios.get(
      `${baseURL}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    res.json({
      status: response.data.status,
      details: response.data,
      payment_source: response.data.payment_source,
      create_time: response.data.create_time,
      update_time: response.data.update_time,
    });
  } catch (error) {
    handlePayPalError(error, res);
  }
});

// Ruta para capturar el pago (debe ser llamada después de que el usuario complete el pago)
router.post('/capture-order/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${baseURL}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Prefer': 'return=representation',
        },
      }
    );

    // Verificar si el pago fue capturado correctamente
    if (response.data.status === 'COMPLETED') {
      // Actualizar la cantidad de cada producto basado en lo que se haya comprado
      const items = response.data.purchase_units[0]?.items || [];
      for (const item of items) {
        const productoId = item.sku;  // Suponiendo que el SKU sea el ID del producto en la base de datos
        const cantidadComprada = item.quantity;

        // Log para verificar si el SKU y la cantidad son correctos
        console.log('Actualizando producto:', productoId, 'Cantidad comprada:', cantidadComprada);

        // Actualizar la base de datos para disminuir la cantidad
        await pool.query('UPDATE productos SET cantidad = cantidad - ? WHERE id = ?', [cantidadComprada, productoId]);
      }

      // Devolver respuesta con éxito
      res.json({
        status: response.data.status,
        capture_id: response.data.purchase_units[0]?.payments?.captures[0]?.id,
        details: response.data,
      });
    } else {
      throw new Error('Pago no capturado exitosamente');
    }

  } catch (error) {
    handlePayPalError(error, res);
  }
});
    

module.exports = router;