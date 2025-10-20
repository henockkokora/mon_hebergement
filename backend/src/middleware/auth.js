import jwt from 'jsonwebtoken';

export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Si l'ID est un email (isEmailId est true), on utilise l'email comme identifiant
    // Sinon, on utilise l'ID normalement (pour la rétrocompatibilité)
    req.user = { 
      id: payload.id, 
      role: payload.role,
      isEmailId: payload.isEmailId || false
    };
    next();
  } catch (e) {
    console.error('Erreur de vérification du token:', e);
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}

export function signToken(user) {
  // Utiliser l'ID de l'utilisateur s'il existe, sinon utiliser l'email comme identifiant
  const id = user._id && user._id.toString ? user._id.toString() : 
             (user.id || user.email || '');
  const payload = { 
    id, 
    role: user.role,
    // Ajouter un flag pour indiquer si c'est un ID ou un email
    isEmailId: !user._id && !user.id
  };
  const opts = { expiresIn: process.env.JWT_EXPIRES_IN || '7d' };
  return jwt.sign(payload, process.env.JWT_SECRET, opts);
}

export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé (admin requis)' });
  }
  next();
}
