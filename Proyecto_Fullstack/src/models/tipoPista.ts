// src/models/TipoPista.ts

export interface TipoPista {
  id: number;
  nombre: string; // 'Fútbol 5', 'Fútbol 7', 'Tenis', 'Padel', 'Baloncesto', etc.
  descripcion?: string;
  created_at?: Date;
}

// DTO para crear tipo de pista
export interface CrearTipoPistaDTO {
  nombre: string;
  descripcion?: string;
}

// DTO para actualizar tipo de pista
export interface ActualizarTipoPistaDTO {
  nombre?: string;
  descripcion?: string;
}