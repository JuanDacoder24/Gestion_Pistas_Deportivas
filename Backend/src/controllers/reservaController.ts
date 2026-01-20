// src/controllers/reserva.controllers.ts

import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { CrearReservaDTO, ActualizarReservaDTO } from '../models/reserva';

// Obtener todas las reservas
export const obtenerReservas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usuario_id, pista_id, estado } = req.query;
    
    let query = `
      SELECT 
        r.id, r.fecha_reserva, r.hora_inicio, r.hora_fin, r.precio_total, r.estado, r.notas,
        u.id as usuario_id, u.nombre as usuario_nombre, u.apellido as usuario_apellido,
        p.id as pista_id, p.nombre as pista_nombre,
        tp.nombre as tipo_pista_nombre
      FROM reservas r
      INNER JOIN usuarios u ON r.usuario_id = u.id
      INNER JOIN pistas p ON r.pista_id = p.id
      INNER JOIN tipos_pista tp ON p.tipo_pista_id = tp.id
    `;
    
    const condiciones: string[] = [];
    const valores: any[] = [];
    
    if (usuario_id) {
      condiciones.push('r.usuario_id = ?');
      valores.push(usuario_id);
    }
    
    if (pista_id) {
      condiciones.push('r.pista_id = ?');
      valores.push(pista_id);
    }
    
    if (estado) {
      condiciones.push('r.estado = ?');
      valores.push(estado);
    }
    
    if (condiciones.length > 0) {
      query += ' WHERE ' + condiciones.join(' AND ');
    }
    
    query += ' ORDER BY r.fecha_reserva DESC, r.hora_inicio DESC';
    
    const [rows] = await pool.query<RowDataPacket[]>(query, valores);
    
    const reservasFormateadas = rows.map(row => ({
      id: row.id,
      usuario: {
        id: row.usuario_id,
        nombre: row.usuario_nombre,
        apellido: row.usuario_apellido
      },
      pista: {
        id: row.pista_id,
        nombre: row.pista_nombre,
        tipo_pista: row.tipo_pista_nombre
      },
      fecha_reserva: row.fecha_reserva,
      hora_inicio: row.hora_inicio,
      hora_fin: row.hora_fin,
      precio_total: row.precio_total,
      estado: row.estado,
      notas: row.notas
    }));
    
    res.json(reservasFormateadas);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

// Obtener reserva por ID
export const obtenerReservaPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        r.id, r.fecha_reserva, r.hora_inicio, r.hora_fin, r.precio_total, r.estado, r.notas,
        u.id as usuario_id, u.nombre as usuario_nombre, u.apellido as usuario_apellido,
        p.id as pista_id, p.nombre as pista_nombre,
        tp.nombre as tipo_pista_nombre
      FROM reservas r
      INNER JOIN usuarios u ON r.usuario_id = u.id
      INNER JOIN pistas p ON r.pista_id = p.id
      INNER JOIN tipos_pista tp ON p.tipo_pista_id = tp.id
      WHERE r.id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      res.status(404).json({ error: 'Reserva no encontrada' });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ error: 'Error al obtener reserva' });
  }
};

// Crear reserva
export const crearReserva = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usuario_id, pista_id, fecha_reserva, hora_inicio, hora_fin, notas }: CrearReservaDTO = req.body;
    
    if (!usuario_id || !pista_id || !fecha_reserva || !hora_inicio || !hora_fin) {
      res.status(400).json({ error: 'Todos los campos son obligatorios' });
      return;
    }
    
    // Verificar usuario
    const [usuarios] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM usuarios WHERE id = ? AND estado = ?',
      [usuario_id, 'activo']
    );
    
    if (usuarios.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado o inactivo' });
      return;
    }
    
    // Verificar pista
    const [pistas] = await pool.query<RowDataPacket[]>(
      'SELECT id, precio_hora, estado FROM pistas WHERE id = ?',
      [pista_id]
    );
    
    if (pistas.length === 0) {
      res.status(404).json({ error: 'Pista no encontrada' });
      return;
    }
    
    if (pistas[0].estado !== 'disponible') {
      res.status(400).json({ error: 'La pista no está disponible' });
      return;
    }
    
    // Verificar conflictos
    const [conflictos] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM reservas 
       WHERE pista_id = ? 
       AND fecha_reserva = ? 
       AND estado != 'cancelada'
       AND hora_inicio = ?`,
      [pista_id, fecha_reserva, hora_inicio]
    );
    
    if (conflictos.length > 0) {
      res.status(409).json({ error: 'Ya existe una reserva para esta pista en ese horario' });
      return;
    }
    
    // Calcular precio
    const horaInicio = new Date(`2000-01-01T${hora_inicio}`);
    const horaFin = new Date(`2000-01-01T${hora_fin}`);
    const horas = (horaFin.getTime() - horaInicio.getTime()) / (1000 * 60 * 60);
    const precio_total = horas * pistas[0].precio_hora;
    
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO reservas (usuario_id, pista_id, fecha_reserva, hora_inicio, hora_fin, precio_total, notas) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [usuario_id, pista_id, fecha_reserva, hora_inicio, hora_fin, precio_total, notas || null]
    );
    
    res.status(201).json({
      mensaje: 'Reserva creada exitosamente',
      reserva: {
        id: result.insertId,
        usuario_id,
        pista_id,
        fecha_reserva,
        hora_inicio,
        hora_fin,
        precio_total,
        estado: 'pendiente'
      }
    });
  } catch (error: any) {
    console.error('Error al crear reserva:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Ya existe una reserva para esta pista en ese horario' });
      return;
    }
    
    res.status(500).json({ error: 'Error al crear reserva' });
  }
};

// Actualizar reserva
export const actualizarReserva = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const datosActualizar: ActualizarReservaDTO = req.body;
    
    const [reservas] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM reservas WHERE id = ?',
      [id]
    );
    
    if (reservas.length === 0) {
      res.status(404).json({ error: 'Reserva no encontrada' });
      return;
    }
    
    const camposActualizar: string[] = [];
    const valores: any[] = [];
    
    if (datosActualizar.estado) {
      camposActualizar.push('estado = ?');
      valores.push(datosActualizar.estado);
    }
    
    if (datosActualizar.notas !== undefined) {
      camposActualizar.push('notas = ?');
      valores.push(datosActualizar.notas);
    }
    
    if (camposActualizar.length === 0) {
      res.status(400).json({ error: 'No hay campos para actualizar' });
      return;
    }
    
    valores.push(id);
    
    const query = `UPDATE reservas SET ${camposActualizar.join(', ')} WHERE id = ?`;
    await pool.query(query, valores);
    
    res.json({ mensaje: 'Reserva actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ error: 'Error al actualizar reserva' });
  }
};

// Cancelar reserva
export const cancelarReserva = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const [reservas] = await pool.query<RowDataPacket[]>(
      'SELECT id, estado FROM reservas WHERE id = ?',
      [id]
    );
    
    if (reservas.length === 0) {
      res.status(404).json({ error: 'Reserva no encontrada' });
      return;
    }
    
    if (reservas[0].estado === 'cancelada') {
      res.status(400).json({ error: 'La reserva ya está cancelada' });
      return;
    }
    
    await pool.query(
      'UPDATE reservas SET estado = ? WHERE id = ?',
      ['cancelada', id]
    );
    
    res.json({ mensaje: 'Reserva cancelada exitosamente' });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ error: 'Error al cancelar reserva' });
  }
};

// Consultar disponibilidad
export const consultarDisponibilidad = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pista_id, fecha } = req.query;
    
    if (!pista_id || !fecha) {
      res.status(400).json({ error: 'Se requiere pista_id y fecha' });
      return;
    }
    
    const [pistas] = await pool.query<RowDataPacket[]>(
      'SELECT id, nombre, estado FROM pistas WHERE id = ?',
      [pista_id]
    );
    
    if (pistas.length === 0) {
      res.status(404).json({ error: 'Pista no encontrada' });
      return;
    }
    
    const [reservas] = await pool.query<RowDataPacket[]>(
      `SELECT hora_inicio, hora_fin 
       FROM reservas 
       WHERE pista_id = ? 
       AND fecha_reserva = ? 
       AND estado != 'cancelada'
       ORDER BY hora_inicio`,
      [pista_id, fecha]
    );
    
    res.json({
      pista_id,
      fecha,
      disponible: pistas[0].estado === 'disponible',
      reservas_existentes: reservas
    });
  } catch (error) {
    console.error('Error al consultar disponibilidad:', error);
    res.status(500).json({ error: 'Error al consultar disponibilidad' });
  }
};