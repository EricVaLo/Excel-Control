require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const auth = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../frontend')));

// Base de datos de usuarios (archivo JSON)
const USERS_FILE = path.join(__dirname, '../users.json');

// Crear archivo de usuarios si no existe
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({
    "soraentertaiment@gmail.com": {
      "password": "admin123",
      "role": "admin",
      "users": []
    }
  }));
}

// Rutas de autenticación
app.post('/api/login', (req, res) => auth.login(req, res, USERS_FILE));
app.post('/api/register', (req, res) => auth.register(req, res, USERS_FILE));

// Ruta protegida para administradores
app.get('/api/users', (req, res) => auth.getUsers(req, res, USERS_FILE));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
  console.log(`Usuarios registrados en: ${USERS_FILE}`);
});