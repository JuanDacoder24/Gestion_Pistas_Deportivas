// src/controllers/usuarioController.ts
import { Request, Response } from 'express'

import { pool } from "../config/database";
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { CrearUsuarioDTO, ActualizarUsuarioDTO, UsuarioResponseDTO } from '../models/usuario';

//obtener usuarios
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id, nombre, apellido, email, telefono, rol, estado, created_at FROM usuarios'
        )
        res.json(rows)
    } catch (error) {
        console.error('Error al obtener usuarios:', error)
        res.status(500).json({ error: 'Error al obtener usaurios' })
    }
}

//obtener usuarios por id
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id, nombre, apellido, email, telefono, rol, estado, created_at FROM usuarios WHERE id = ?',
            [id]
        )

        if (rows.length === 0) {
            res.status(404).json({ error: 'Usuario no encontrado' })
            return
        }
        res.json(rows[0])
    } catch (error) {
        console.error('Error al obtener usuario:', error)
        res.status(500).json({ error: 'Error al obtener usuario' })

    }
}
// Crear un nuevo usuario
export const crearUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre, apellido, email, telefono, password, rol }: CrearUsuarioDTO = req.body

        // Validar campos requeridos
        if (!nombre || !apellido || !email || !telefono || !password) {
            res.status(400).json({ error: 'Todos los campos son obligatorios' })
            return
        }

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO usuarios (nombre, apellido, email, telefono, password, rol) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, apellido, email, telefono, password, rol || 'cliente']
        )

        const usuarioCreado: UsuarioResponseDTO = {
            id: result.insertId,
            nombre,
            apellido,
            email,
            telefono,
            rol: rol || 'cliente',
            estado: 'activo'
        }

        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: usuarioCreado
        })
    } catch (error: any) {
        console.error('Error al crear usuario:', error)

        // Error de email duplicado
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'El email ya está registrado' })
            return
        }

        res.status(500).json({ error: 'Error al crear usuario' })
    }
}

// Actualizar un usuario
export const actualizarUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const datosActualizar: ActualizarUsuarioDTO = req.body

        // Verificar que el usuario existe
        const [usuarios] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM usuarios WHERE id = ?',
            [id]
        )

        if (usuarios.length === 0) {
            res.status(404).json({ error: 'Usuario no encontrado' })
            return;
        }

        // Construir query dinámicamente solo con los campos que se envían
        const camposActualizar: string[] = []
        const valores: any[] = [];

        if (datosActualizar.nombre) {
            camposActualizar.push('nombre = ?')
            valores.push(datosActualizar.nombre)
        }

        if (datosActualizar.apellido) {
            camposActualizar.push('apellido = ?')
            valores.push(datosActualizar.apellido)
        }

        if (datosActualizar.email) {
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(datosActualizar.email)) {
                res.status(400).json({ error: 'Email inválido' })
                return;
            }
            camposActualizar.push('email = ?')
            valores.push(datosActualizar.email)
        }

        if (datosActualizar.telefono) {
            camposActualizar.push('telefono = ?')
            valores.push(datosActualizar.telefono)
        }

        if (datosActualizar.password) {
            // TODO: Hashear password con bcrypt
            camposActualizar.push('password = ?')
            valores.push(datosActualizar.password)
        }

        if (datosActualizar.estado) {
            camposActualizar.push('estado = ?')
            valores.push(datosActualizar.estado)
        }

        if (camposActualizar.length === 0) {
            res.status(400).json({ error: 'No hay campos para actualizar' })
            return
        }

        // Agregar el ID al final de los valores
        valores.push(id);

        const query = `UPDATE usuarios SET ${camposActualizar.join(', ')} WHERE id = ?`

        await pool.query(query, valores)

        // Obtener el usuario actualizado
        const [usuarioActualizado] = await pool.query<RowDataPacket[]>(
            'SELECT id, nombre, apellido, email, telefono, rol, estado, created_at FROM usuarios WHERE id = ?',
            [id]
        )

        res.json({
            mensaje: 'Usuario actualizado exitosamente',
            usuario: usuarioActualizado[0]
        })
    } catch (error: any) {
        console.error('Error al actualizar usuario:', error)

        // Error de email duplicado
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'El email ya está registrado por otro usuario' })
            return
        }

        res.status(500).json({ error: 'Error al actualizar usuario' })
    }
}

// Eliminar un usuario (soft delete - cambiar estado a inactivo)
export const eliminarUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params

        // Verificar que el usuario existe
        const [usuarios] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM usuarios WHERE id = ?',
            [id]
        );

        if (usuarios.length === 0) {
            res.status(404).json({ error: 'Usuario no encontrado' })
            return
        }

        // Soft delete - cambiar estado a inactivo
        await pool.query(
            'UPDATE usuarios SET estado = ? WHERE id = ?',
            ['inactivo', id]
        );

        res.json({ mensaje: 'Usuario eliminado exitosamente' })
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' })
    }
}


