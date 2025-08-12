const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');
const userService = require('../services/user.service');

// helper to send cookie
function sendTokenCookie(res, payload) {
  const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
  // cookie segura: httpOnly
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 2 // 2 horas
  });
}

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email y contraseña son requeridos' });

  const user = await userService.findByEmail(email);
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });

  const payload = { id: user.id, email: user.email, role: user.role };
  sendTokenCookie(res, payload);

  return res.json({ message: 'Login OK', user: { email: user.email, role: user.role } });
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out' });
};

exports.me = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'No autenticado' });
  try {
    const data = jwt.verify(token, jwtSecret);
    return res.json({ user: data });
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};