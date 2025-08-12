const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DATA_PATH = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_PATH, 'users.json');

if (!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH, { recursive: true });

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')) || [];
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Inicializa admin si no existe (PARA PRUEBAS)
(function ensureAdmin() {
  const email = 'soraentertaiment@gmail.com';
  const rawPassword = '123456789.VL'; // solo para pruebas
  const users = readUsers();
  const exists = users.find(u => u.email === email);
  if (!exists) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(rawPassword, salt);
    const admin = { id: uuidv4(), email, passwordHash, role: 'admin', createdAt: new Date().toISOString() };
    users.push(admin);
    writeUsers(users);
    console.log('[user.service] Admin creado para pruebas:', email);
  }
})();

module.exports = {
  findByEmail: async (email) => {
    const users = readUsers();
    return users.find(u => u.email === email) || null;
  },
  // funciones básicas para futuro CRUD
  createUser: async ({ email, rawPassword, role = 'user' }) => {
    const users = readUsers();
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(rawPassword, salt);
    const user = { id: uuidv4(), email, passwordHash, role, createdAt: new Date().toISOString() };
    users.push(user);
    writeUsers(users);
    return user;
  }
};