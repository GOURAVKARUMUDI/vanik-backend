import { admin, db } from '../firebaseAdmin.js';

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify Firebase ID token
            const decodedToken = await admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;

            // Fetch user from RTDB
            const userSnapshot = await db.ref(`users/${uid}`).once('value');
            if (userSnapshot.exists()) {
                req.user = userSnapshot.val();

                // Add _id backward compatibility since some controllers might use req.user._id instead of uid
                req.user._id = uid;
            } else {
                // If they don't have an RTDB profile yet
                req.user = { uid, _id: uid, email: decodedToken.email };
            }

            next();
        } catch (error) {
            console.error('Firebase Auth Error:', error);
            res.status(401);
            next(new Error('Not authorized, token failed'));
        }
    } else {
        res.status(401);
        next(new Error('Not authorized, no token'));
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401);
        next(new Error('Not authorized as an admin'));
    }
};

export { protect, adminMiddleware as admin };
