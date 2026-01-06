// src/models/Pista.ts

export interface Pista {
  id: number;
  nombre: string; // 'Pista 1', 'Cancha Central', etc.
  tipo_pista_id: number;
  descripcion?: string;
  capacidad: number; // Número de jugadores
  precio_hora: number; // Precio por hora de reserva
  estado: 'disponible' | 'mantenimiento' | 'inactiva';
  imagen_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

// DTO para crear pista
export interface CrearPistaDTO {
  nombre: string;
  tipo_pista_id: number;
  descripcion?: string;
  capacidad: number;
  precio_hora: number;
  imagen_url?: string;
}

// DTO para actualizar pista
export interface ActualizarPistaDTO {
  nombre?: string;
  tipo_pista_id?: number;
  descripcion?: string;
  capacidad?: number;
  precio_hora?: number;
  estado?: 'disponible' | 'mantenimiento' | 'inactiva';
  imagen_url?: string;
}

// DTO para respuesta con información del tipo de pista
export interface PistaConTipoDTO {
  id: number;
  nombre: string;
  tipo_pista: {
    id: number;
    nombre: string;
  };
  descripcion?: string;
  capacidad: number;
  precio_hora: number;
  estado: 'disponible' | 'mantenimiento' | 'inactiva';
  imagen_url?: string;
}