// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Add console.logs to debug
const authRoutes = require('./routes/auth');
console.log('authRoutes:', authRoutes); // Should show [Function]

const userRoutes = require('./routes/users');
console.log('userRoutes:', userRoutes); // Should show [Function]

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});