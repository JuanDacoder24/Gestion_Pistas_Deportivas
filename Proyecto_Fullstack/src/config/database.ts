import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Crear pool de conexiones
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'daw12',
  database: process.env.DB_NAME || 'gestion_pistas_deportivas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para probar la conexión (no finaliza la app si falla)
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a MySQL exitosa');
    connection.release();
    return true;
  } catch (error: any) {
    console.error('Error al conectar a MySQL:', error.message || error);
    console.error('Comprueba tus credenciales de base de datos y crea un archivo .env con DB_USER y DB_PASSWORD si es necesario.');
    return false;
  }
};
