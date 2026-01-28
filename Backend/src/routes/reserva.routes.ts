// src/routes/reserva.routes.ts

import { Router } from 'express';
import * as reservaController from '../controllers/reservaController';

const router = Router();

router.get('/', reservaController.obtenerReservas);
router.get('/disponibilidad', reservaController.consultarDisponibilidad);
router.get('/:id', reservaController.obtenerReservaPorId);
router.post('/', reservaController.crearReserva);
router.put('/:id', reservaController.actualizarReserva);
router.delete('/:id', reservaController.cancelarReserva);

export default router;