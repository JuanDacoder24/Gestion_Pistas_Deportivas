// src/routes/usuario.routes.ts

import { Router } from 'express';
import * as usuarioController from '../controllers/usuarioController';

const router = Router();

// Rutas públicas
//router.post('/login', usuarioController.login);
router.post('/registro', usuarioController.crearUsuario);

// Rutas de usuarios
router.get('/', usuarioController.getAllUsers);
router.get('/:id', usuarioController.getUserById);
router.put('/:id', usuarioController.actualizarUsuario);
router.delete('/:id', usuarioController.eliminarUsuario);

// Ruta solo para administradores
// router.delete('/:id/permanente', usuarioController.eliminarUsuarioPermanente);

export default router;