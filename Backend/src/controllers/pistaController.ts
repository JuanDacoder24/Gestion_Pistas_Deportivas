import { Request, Response } from 'express'
import { pool } from "../config/database";
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { CrearPistaDTO, ActualizarPistaDTO,  } from '../models/pista';

export const getAllPistas = async (req: Request, res: Response): Promise<void> => {
    try{
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id, nombre, tipo_pista_id, descripcion, capacidad, precio_hora, estado, imagen_url FROM pistas'
        )
        res.json(rows)
    }catch(error){
        console.error('Error al obtener pistas:', error)
        res.status(500).json({ error: 'Error al obtener pistas'})
    }
}

export const getPistasById = async(req: Request, res: Response): Promise<void> => {
    try{
        const { id } = req.params
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id, nombre, tipo_pista_id, descripcion, capacidad, precio_hora, estado, imagen_url FROM pistas WHERE id = ?',
            [id]
        )

        if(rows.length === 0){
            res.status(404).json({ error: 'Pista no encontrada'})
            return
        }
        res.json(rows[0])
    }catch(error){
        console.error('Error al obtener pista: ', error)
        res.status(500).json({error: 'Error al obtener usuario'})
    }
}