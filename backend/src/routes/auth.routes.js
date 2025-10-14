import { Router } from 'express';
import { authController, authenticateToken } from '../controllers/authController.js';

const router = Router();

// Rutas de autenticación
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/profile', authenticateToken, authController.getProfile);
router.get('/users', authenticateToken, authController.getAllUsers);

export default router;
