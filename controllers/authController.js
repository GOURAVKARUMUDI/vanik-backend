import { db } from '../firebaseAdmin.js';

// The frontend authService.js handles Firebase Authentication directly now.
// These routes are kept as fallbacks/stubs that return generic successful user details 
// if old frontend code still attempts to use them during the transition.

const registerUser = async (req, res, next) => {
    try {
        res.status(201).json({ message: "Auth is now handled completely by Firebase Auth on the frontend." });
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        res.json({ message: "Auth is now handled completely by Firebase Auth on the frontend." });
    } catch (error) {
        next(error);
    }
};

export { registerUser, loginUser };
