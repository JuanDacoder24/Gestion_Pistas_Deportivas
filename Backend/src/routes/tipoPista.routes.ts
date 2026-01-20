// src/routes/tipoPista.routes.ts

import { Router } from 'express';
import * as tipoPistaController from '../controllers/tipoPistaController';

const router = Router();

router.get('/', tipoPistaController.obtenerTiposPista);
router.get('/:id', tipoPistaController.obtenerTipoPistaPorId);
router.post('/', tipoPistaController.crearTipoPista);
router.put('/:id', tipoPistaController.actualizarTipoPista);
router.delete('/:id', tipoPistaController.eliminarTipoPista);

export default router;