import jwt from 'jsonwebtoken';

function getTokenFromHeader(authorizationHeader) {
  if (!authorizationHeader) return null;
  const parts = authorizationHeader.split(' ');
  if (parts.length !== 2) return null;
  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) return null;
  return token;
}

export function requireAuth(req, res, next) {
  try {
    const token = getTokenFromHeader(req.headers.authorization);
    if (!token) return res.status(401).json({ message: 'Missing access token' });
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { userId: payload.sub, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
}
