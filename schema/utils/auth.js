import jwt from 'jsonwebtoken';

export const authenticate = (token) => {
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET || 'secret');
    
    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid token');
  }
};




