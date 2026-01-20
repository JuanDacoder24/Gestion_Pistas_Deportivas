// src/controllers/tipoPista.controllers.ts

import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { CrearTipoPistaDTO, ActualizarTipoPistaDTO } from '../models/tipoPista';

// Obtener todos los tipos de pista
export const obtenerTiposPista = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tipos_pista ORDER BY nombre'
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tipos de pista:', error);
    res.status(500).json({ error: 'Error al obtener tipos de pista' });
  }
};

// Obtener un tipo de pista por ID
export const obtenerTipoPistaPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tipos_pista WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      res.status(404).json({ error: 'Tipo de pista no encontrado' });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener tipo de pista:', error);
    res.status(500).json({ error: 'Error al obtener tipo de pista' });
  }
};

// Crear un nuevo tipo de pista
export const crearTipoPista = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, descripcion }: CrearTipoPistaDTO = req.body;
    
    if (!nombre) {
      res.status(400).json({ error: 'El nombre es obligatorio' });
      return;
    }
    
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO tipos_pista (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion || null]
    );
    
    res.status(201).json({
      mensaje: 'Tipo de pista creado exitosamente',
      tipoPista: {
        id: result.insertId,
        nombre,
        descripcion: descripcion || null
      }
    });
  } catch (error: any) {
    console.error('Error al crear tipo de pista:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Ya existe un tipo de pista con ese nombre' });
      return;
    }
    
    res.status(500).json({ error: 'Error al crear tipo de pista' });
  }
};

// Actualizar un tipo de pista
export const actualizarTipoPista = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const datosActualizar: ActualizarTipoPistaDTO = req.body;
    
    const [tiposPista] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM tipos_pista WHERE id = ?',
      [id]
    );
    
    if (tiposPista.length === 0) {
      res.status(404).json({ error: 'Tipo de pista no encontrado' });
      return;
    }
    
    const camposActualizar: string[] = [];
    const valores: any[] = [];
    
    if (datosActualizar.nombre) {
      camposActualizar.push('nombre = ?');
      valores.push(datosActualizar.nombre);
    }
    
    if (datosActualizar.descripcion !== undefined) {
      camposActualizar.push('descripcion = ?');
      valores.push(datosActualizar.descripcion);
    }
    
    if (camposActualizar.length === 0) {
      res.status(400).json({ error: 'No hay campos para actualizar' });
      return;
    }
    
    valores.push(id);
    
    const query = `UPDATE tipos_pista SET ${camposActualizar.join(', ')} WHERE id = ?`;
    await pool.query(query, valores);
    
    const [tipoPistaActualizado] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tipos_pista WHERE id = ?',
      [id]
    );
    
    res.json({
      mensaje: 'Tipo de pista actualizado exitosamente',
      tipoPista: tipoPistaActualizado[0]
    });
  } catch (error: any) {
    console.error('Error al actualizar tipo de pista:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Ya existe un tipo de pista con ese nombre' });
      return;
    }
    
    res.status(500).json({ error: 'Error al actualizar tipo de pista' });
  }
};

// Eliminar un tipo de pista
export const eliminarTipoPista = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const [tiposPista] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM tipos_pista WHERE id = ?',
      [id]
    );
    
    if (tiposPista.length === 0) {
      res.status(404).json({ error: 'Tipo de pista no encontrado' });
      return;
    }
    
    // Verificar si hay pistas asociadas
    const [pistasAsociadas] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM pistas WHERE tipo_pista_id = ?',
      [id]
    );
    
    if (pistasAsociadas[0].total > 0) {
      res.status(409).json({ 
        error: 'No se puede eliminar el tipo de pista porque hay pistas asociadas',
        pistasAsociadas: pistasAsociadas[0].total
      });
      return;
    }
    
    await pool.query('DELETE FROM tipos_pista WHERE id = ?', [id]);
    
    res.json({ mensaje: 'Tipo de pista eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar tipo de pista:', error);
    res.status(500).json({ error: 'Error al eliminar tipo de pista' });
  }
};