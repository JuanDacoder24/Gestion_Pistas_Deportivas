// src/routes/pista.routes.ts

import { Router } from 'express';
import * as pistaController from '../controllers/pistaController';

const router = Router();

router.get('/', pistaController.obtenerPistas);
router.get('/:id', pistaController.obtenerPistaPorId);
router.post('/', pistaController.crearPista);
router.put('/:id', pistaController.actualizarPista);
router.delete('/:id', pistaController.eliminarPista);

export default router;