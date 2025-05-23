const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const bcrypt = require('bcrypt');

// Ruta para registrar usuario
router.post('/register', async (req, res) => {
  const { email, password, nombre, rol } = req.body;

  if (!email || !password || !nombre || !rol) {
    return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
  }

  try {
    // Verificar si ya existe usuario con ese email
    const [existingUser] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, message: 'El email ya está registrado' });
    }

    // Encriptar la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insertar usuario en BD
    const [result] = await pool.query(
      'INSERT INTO usuarios (email, password, rol, nombre, fecha_creacion) VALUES (?, ?, ?, ?, NOW())',
      [email, hashedPassword, rol, nombre]
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Ruta para login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ success: false, message: 'Email y contraseña requeridos' });

  try {
    // Buscar usuario por email
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

    const user = rows[0];

    // Validar contraseña con bcrypt
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

    // Responder con datos sin contraseña
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        rol: user.rol,
        nombre: user.nombre
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Simula enviar email de recuperación
router.post('/recuperar-contrasena', async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Email no encontrado' });
    }
    // Aquí mandar email real en un caso real
    res.json({ success: true, message: 'Correo de recuperación enviado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error en servidor' });
  }
});

// Cambiar contraseña
router.post('/cambiar-contrasena', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Faltan datos' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'UPDATE usuarios SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Email no encontrado' });
    }

    res.json({ success: true, message: 'Contraseña cambiada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error en servidor' });
  }
});

module.exports = router;
