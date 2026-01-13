

// src/models/Usuario.ts

export interface Usuario {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  password: string
  rol: 'admin' | 'cliente'
  estado: 'activo' | 'inactivo'
}

// las dtos sirven para transportar datos entre capas o servicios de una aplicación, 
// sin lógica de negocio dentro. Se usan para desacoplar el modelo 
// interno de la API de lo que se expone al exterior, validar entradas/salidas 
// y evitar exponer entidades de base de datos directamente
export interface CrearUsuarioDTO {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  rol?: 'admin' | 'cliente'; // Opcional, por defecto 'cliente'
}

export interface ActualizarUsuarioDTO {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  password?: string;
  estado?: 'activo' | 'inactivo';
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UsuarioResponseDTO {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: 'admin' | 'cliente';
  estado: 'activo' | 'inactivo';
  created_at?: Date;
}






