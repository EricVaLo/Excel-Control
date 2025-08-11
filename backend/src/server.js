require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares básicos
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas
const excelRoutes = require('./routes/excelRoutes');
app.use('/api/excel', excelRoutes);

// Servir archivos estáticos
const storagePath = path.join(__dirname, '../storage');
app.use('/files', express.static(storagePath));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Backend para gestión de Excel funcionando!');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`Archivos guardados en: ${storagePath}`);
});