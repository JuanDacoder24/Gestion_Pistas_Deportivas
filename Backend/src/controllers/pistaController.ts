// src/controllers/pista.controllers.ts

import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { CrearPistaDTO, ActualizarPistaDTO } from '../models/pista';

// Obtener todas las pistas
export const obtenerPistas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo_pista_id, estado } = req.query;
    
    let query = `
      SELECT 
        p.id, p.nombre, p.descripcion, p.capacidad, p.precio_hora, 
        p.estado, p.imagen_url, p.created_at, p.updated_at,
        tp.id as tipo_id, tp.nombre as tipo_nombre
      FROM pistas p
      INNER JOIN tipos_pista tp ON p.tipo_pista_id = tp.id
    `;
    
    const condiciones: string[] = [];
    const valores: any[] = [];
    
    if (tipo_pista_id) {
      condiciones.push('p.tipo_pista_id = ?');
      valores.push(tipo_pista_id);
    }
    
    if (estado) {
      condiciones.push('p.estado = ?');
      valores.push(estado);
    }
    
    if (condiciones.length > 0) {
      query += ' WHERE ' + condiciones.join(' AND ');
    }
    
    query += ' ORDER BY p.nombre';
    
    const [rows] = await pool.query<RowDataPacket[]>(query, valores);
    
    const pistasFormateadas = rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      tipo_pista: {
        id: row.tipo_id,
        nombre: row.tipo_nombre
      },
      descripcion: row.descripcion,
      capacidad: row.capacidad,
      precio_hora: row.precio_hora,
      estado: row.estado,
      imagen_url: row.imagen_url
    }));
    
    res.json(pistasFormateadas);
  } catch (error) {
    console.error('Error al obtener pistas:', error);
    res.status(500).json({ error: 'Error al obtener pistas' });
  }
};

// Obtener pista por ID
export const obtenerPistaPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        p.id, p.nombre, p.descripcion, p.capacidad, p.precio_hora, 
        p.estado, p.imagen_url,
        tp.id as tipo_id, tp.nombre as tipo_nombre
      FROM pistas p
      INNER JOIN tipos_pista tp ON p.tipo_pista_id = tp.id
      WHERE p.id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      res.status(404).json({ error: 'Pista no encontrada' });
      return;
    }
    
    const pista = {
      id: rows[0].id,
      nombre: rows[0].nombre,
      tipo_pista: {
        id: rows[0].tipo_id,
        nombre: rows[0].tipo_nombre
      },
      descripcion: rows[0].descripcion,
      capacidad: rows[0].capacidad,
      precio_hora: rows[0].precio_hora,
      estado: rows[0].estado,
      imagen_url: rows[0].imagen_url
    };
    
    res.json(pista);
  } catch (error) {
    console.error('Error al obtener pista:', error);
    res.status(500).json({ error: 'Error al obtener pista' });
  }
};

// Crear pista
export const crearPista = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, tipo_pista_id, descripcion, capacidad, precio_hora, imagen_url }: CrearPistaDTO = req.body;
    
    if (!nombre || !tipo_pista_id || !capacidad || !precio_hora) {
      res.status(400).json({ error: 'Nombre, tipo de pista, capacidad y precio son obligatorios' });
      return;
    }
    
    const [tiposPista] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM tipos_pista WHERE id = ?',
      [tipo_pista_id]
    );
    
    if (tiposPista.length === 0) {
      res.status(404).json({ error: 'El tipo de pista especificado no existe' });
      return;
    }
    
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO pistas (nombre, tipo_pista_id, descripcion, capacidad, precio_hora, imagen_url) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, tipo_pista_id, descripcion || null, capacidad, precio_hora, imagen_url || null]
    );
    
    res.status(201).json({
      mensaje: 'Pista creada exitosamente',
      pista: {
        id: result.insertId,
        nombre,
        tipo_pista_id,
        capacidad,
        precio_hora,
        estado: 'disponible'
      }
    });
  } catch (error) {
    console.error('Error al crear pista:', error);
    res.status(500).json({ error: 'Error al crear pista' });
  }
};

// Actualizar pista
export const actualizarPista = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const datosActualizar: ActualizarPistaDTO = req.body;
    
    const [pistas] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM pistas WHERE id = ?',
      [id]
    );
    
    if (pistas.length === 0) {
      res.status(404).json({ error: 'Pista no encontrada' });
      return;
    }
    
    const camposActualizar: string[] = [];
    const valores: any[] = [];
    
    if (datosActualizar.nombre) {
      camposActualizar.push('nombre = ?');
      valores.push(datosActualizar.nombre);
    }
    
    if (datosActualizar.tipo_pista_id) {
      camposActualizar.push('tipo_pista_id = ?');
      valores.push(datosActualizar.tipo_pista_id);
    }
    
    if (datosActualizar.descripcion !== undefined) {
      camposActualizar.push('descripcion = ?');
      valores.push(datosActualizar.descripcion);
    }
    
    if (datosActualizar.capacidad) {
      camposActualizar.push('capacidad = ?');
      valores.push(datosActualizar.capacidad);
    }
    
    if (datosActualizar.precio_hora) {
      camposActualizar.push('precio_hora = ?');
      valores.push(datosActualizar.precio_hora);
    }
    
    if (datosActualizar.estado) {
      camposActualizar.push('estado = ?');
      valores.push(datosActualizar.estado);
    }
    
    if (datosActualizar.imagen_url !== undefined) {
      camposActualizar.push('imagen_url = ?');
      valores.push(datosActualizar.imagen_url);
    }
    
    if (camposActualizar.length === 0) {
      res.status(400).json({ error: 'No hay campos para actualizar' });
      return;
    }
    
    valores.push(id);
    
    const query = `UPDATE pistas SET ${camposActualizar.join(', ')} WHERE id = ?`;
    await pool.query(query, valores);
    
    res.json({ mensaje: 'Pista actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar pista:', error);
    res.status(500).json({ error: 'Error al actualizar pista' });
  }
};

// Eliminar pista
export const eliminarPista = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const [pistas] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM pistas WHERE id = ?',
      [id]
    );
    
    if (pistas.length === 0) {
      res.status(404).json({ error: 'Pista no encontrada' });
      return;
    }
    
    const [reservasAsociadas] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM reservas WHERE pista_id = ?',
      [id]
    );
    
    if (reservasAsociadas[0].total > 0) {
      res.status(409).json({ 
        error: 'No se puede eliminar la pista porque tiene reservas asociadas'
      });
      return;
    }
    
    await pool.query('DELETE FROM pistas WHERE id = ?', [id]);
    
    res.json({ mensaje: 'Pista eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar pista:', error);
    res.status(500).json({ error: 'Error al eliminar pista' });
  }
};