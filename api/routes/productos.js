const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Ruta para obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ success: false, message: 'Error al obtener productos' });
  }
});

// Ruta: Actualizar el stock de productos después de la compra
router.post('/actualizar-stock', async (req, res) => {
  const productos = req.body.productos;

  try {
    for (const prod of productos) {
      await pool.query(
        'UPDATE productos SET cantidad = cantidad - ? WHERE id = ?',
        [prod.cantidad, prod.id]
      );
    }

    res.status(200).json({ success: true, message: 'Stock actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar el stock', 
      error: error.message 
    });
  }
});

// Ruta para obtener un producto por su ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
  } catch (err) {
    console.error('Error al obtener el producto:', err);
    res.status(500).json({ success: false, message: 'Error al obtener el producto' });
  }
});

// Ruta para agregar un producto (CORREGIDO)
router.post('/', async (req, res) => {
  const { nombre, precioP, imagen, cantidad } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO productos (nombre, precioP, imagen, cantidad) VALUES (?, ?, ?, ?)',
      [nombre, precioP, imagen, cantidad]
    );
    res.status(201).json({ success: true, data: { id: result.insertId, nombre, precioP, imagen, cantidad } });
  } catch (err) {
    console.error('Error al agregar producto:', err);
    res.status(500).json({ success: false, message: 'Error al agregar producto' });
  }
});

// Ruta para modificar un producto (CORREGIDO)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, precioP, imagen, cantidad } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE productos SET nombre = ?, precioP = ?, imagen = ?, cantidad = ? WHERE id = ?',
      [nombre, precioP, imagen, cantidad, id]
    );
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Producto actualizado correctamente' });
    } else {
      res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ success: false, message: 'Error al actualizar producto' });
  }
});

// Ruta para eliminar un producto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Producto eliminado correctamente' });
    } else {
      res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar producto' });
  }
});

module.exports = router;