import jwt from 'jsonwebtoken';

const KEY = 'borapracima'; // Pode mudar essa chave secreta se quiser

export function generateToken(userInfo) {
  return jwt.sign(userInfo, KEY);
}

export function getAuthentication(checkRole) {  
  return (req, resp, next) => {
    try {
      let token = req.headers['x-access-token'];
      if (!token) token = req.query['x-access-token'];
    
      let signed = jwt.verify(token, KEY);
    
      req.user = signed;
      
      if (checkRole && !checkRole(signed) && signed.role !== 'admin') {
        return resp.status(403).end();
      }
    
      next();
    } catch (e) {
      resp.status(401).end();
    }
  }
}