const fs = require('fs');
const jwt = require('jsonwebtoken');

module.exports = {
  // Autenticar usuario
  login: (req, res, usersFile) => {
    const { email, password } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFile));
    
    if (users[email] && users[email].password === password) {
      // Crear token JWT
      const token = jwt.sign(
        { email, role: users[email].role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      res.json({ success: true, token, role: users[email].role });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  },
  
  // Registrar nuevo usuario (solo administrador)
  register: (req, res, usersFile) => {
    const { adminToken, newUser } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFile));
    
    try {
      // Verificar token de administrador
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
      
      if (decoded.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Acceso no autorizado' });
      }
      
      // Verificar si el usuario ya existe
      if (users[newUser.email]) {
        return res.status(400).json({ success: false, message: 'El usuario ya existe' });
      }
      
      // Añadir nuevo usuario
      users[newUser.email] = {
        password: newUser.password,
        role: 'user'
      };
      
      // Añadir usuario a la lista del administrador
      if (!users[decoded.email].users) {
        users[decoded.email].users = [];
      }
      users[decoded.email].users.push(newUser.email);
      
      // Guardar en archivo
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      res.json({ success: true, message: 'Usuario registrado con éxito' });
      
    } catch (error) {
      res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
  },
  
  // Obtener lista de usuarios (solo administrador)
  getUsers: (req, res, usersFile) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token no proporcionado' });
    }
    
    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const users = JSON.parse(fs.readFileSync(usersFile));
      
      if (decoded.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Acceso no autorizado' });
      }
      
      // Obtener usuarios registrados por este administrador
      const adminUsers = users[decoded.email].users || [];
      const usersData = adminUsers.map(email => ({
        email,
        role: users[email].role
      }));
      
      res.json({ success: true, users: usersData });
      
    } catch (error) {
      res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
  }
};