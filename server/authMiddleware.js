const admin = require('firebase-admin');

// Инициализация Firebase Admin (если еще не инициализирован)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    // Fallback to application default credentials if service account key is not provided
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp();
    } else {
      console.warn('Firebase Admin SDK not initialized. Auth middleware will reject all requests.');
    }
  }
}

/**
 * Middleware для проверки Firebase Authentication токена
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({ 
        message: 'Unauthorized: No token provided',
        error: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      return res.status(401).send({ 
        message: 'Unauthorized: Invalid token format',
        error: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Проверяем наличие инициализированного Firebase Admin
    if (!admin.apps.length) {
      return res.status(503).send({ 
        message: 'Authentication service unavailable',
        error: 'AUTH_SERVICE_UNAVAILABLE'
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Добавляем информацию о пользователе в объект запроса
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).send({ 
        message: 'Unauthorized: Token expired',
        error: 'TOKEN_EXPIRED'
      });
    }

    if (error.code === 'auth/argument-error') {
      return res.status(401).send({ 
        message: 'Unauthorized: Invalid token',
        error: 'INVALID_TOKEN'
      });
    }

    return res.status(401).send({ 
      message: 'Unauthorized: Authentication failed',
      error: 'AUTH_FAILED',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = authMiddleware;
