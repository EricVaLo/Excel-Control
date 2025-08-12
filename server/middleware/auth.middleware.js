const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');

module.exports = function(requireRole = null) {
  return (req, res, next) => {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No autenticado' });
    try {
      const data = jwt.verify(token, jwtSecret);
      req.user = data;
      if (requireRole && data.role !== requireRole) return res.status(403).json({ message: 'Acceso denegado' });
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  };
};