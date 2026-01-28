// src/server.ts

import express from 'express';
import usuarioRoutes from './routes/usuario.routes';
import tipoPistaRoutes from './routes/tipoPista.routes';
import pistaRoutes from './routes/pista.routes';
import reservaRoutes from './routes/reserva.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    mensaje: '✅ API de Gestión de Pistas Deportivas',
    version: '1.0.0',
    endpoints: {
      usuarios: '/api/usuarios',
      tipos_pista: '/api/tipos-pista',
      pistas: '/api/pistas',
      reservas: '/api/reservas'
    }
  });
});

// Rutas de la API
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/tipos-pista', tipoPistaRoutes);
app.use('/api/pistas', pistaRoutes);
app.use('/api/reservas', reservaRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 API Endpoints:`);
  console.log(`   - Usuarios: http://localhost:${PORT}/api/usuarios`);
  console.log(`   - Tipos Pista: http://localhost:${PORT}/api/tipos-pista`);
  console.log(`   - Pistas: http://localhost:${PORT}/api/pistas`);
  console.log(`   - Reservas: http://localhost:${PORT}/api/reservas`);
});

export default app;