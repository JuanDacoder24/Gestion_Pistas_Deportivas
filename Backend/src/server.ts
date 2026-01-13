// src/server.ts

import express from 'express';
import { testConnection } from './config/database';
import usuarioRoutes from './routes/usuario.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Probar conexión a la base de datos al iniciar
testConnection();

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API de Gestión de Pistas Deportivas',
    version: '1.0.0',
    endpoints: {
      usuarios: '/api/usuarios',
      pistas: '/api/pistas',
      reservas: '/api/reservas'
    }
  });
});

// Rutas de la API
app.use('/api/usuarios', usuarioRoutes);

// Ruta para manejar 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación: http://localhost:${PORT}/api`);
});

export default app;