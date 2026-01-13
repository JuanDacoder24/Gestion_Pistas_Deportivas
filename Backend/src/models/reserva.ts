// src/models/Reserva.ts

export interface Reserva {
  id: number;
  usuario_id: number;
  pista_id: number;
  fecha_reserva: Date; // Fecha de la reserva
  hora_inicio: string; // '09:00', '10:00', etc.
  hora_fin: string; // '10:00', '11:00', etc.
  precio_total: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas?: string;
  created_at?: Date;
  updated_at?: Date;
}

// DTO para crear reserva
export interface CrearReservaDTO {
  usuario_id: number;
  pista_id: number;
  fecha_reserva: string; // 'YYYY-MM-DD'
  hora_inicio: string; // 'HH:MM'
  hora_fin: string; // 'HH:MM'
}

// DTO para actualizar reserva
export interface ActualizarReservaDTO {
  fecha_reserva?: string;
  hora_inicio?: string;
  hora_fin?: string;
  estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
}

// DTO para consultar disponibilidad
export interface ConsultarDisponibilidadDTO {
  pista_id: number;
  fecha: string; // 'YYYY-MM-DD'
}

// DTO para respuesta de disponibilidad
export interface HorariosDisponiblesDTO {
  pista_id: number;
  fecha: string;
  horarios_disponibles: {
    hora_inicio: string;
    hora_fin: string;
  }[];
}

// DTO para respuesta completa de reserva (con info de usuario y pista)
export interface ReservaCompletaDTO {
  id: number;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
  };
  pista: {
    id: number;
    nombre: string;
    tipo_pista: string;
    precio_hora: number;
  };
  fecha_reserva: Date;
  hora_inicio: string;
  hora_fin: string;
  precio_total: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas?: string;
  created_at?: Date;
}