const admin = require('firebase-admin');
require('dotenv').config();

// Decode the base64 service account key
const serviceAccountEncoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
if (!serviceAccountEncoded) {
  console.error('FIREBASE_SERVICE_ACCOUNT_BASE64 is not set. Backend authentication will not work.');
} else {
  try {
    const serviceAccountJson = Buffer.from(serviceAccountEncoded, 'base64').toString('ascii');
    const serviceAccount = JSON.parse(serviceAccountJson);

    if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
    }
  } catch (e) {
    console.error('Failed to parse or initialize Firebase Admin SDK:', e);
  }
}


async function authMiddleware(req, res, next) {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).send('Unauthorized: No token provided.');
  }

  if (!admin.apps.length) {
     return res.status(500).send('Internal Server Error: Firebase Admin SDK not initialized.');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) { 
    console.error('Error verifying auth token:', error);
    return res.status(403).send('Forbidden: Invalid token.');
  }
}

module.exports = authMiddleware;
