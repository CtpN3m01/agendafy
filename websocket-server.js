// websocket-server.js
const WebSocket = require('ws');
const http = require('http');
const url = require('url');

// Mapa para almacenar conexiones WebSocket por email de usuario
const connections = new Map();

// Crear servidor HTTP básico
const server = http.createServer();

// Crear servidor WebSocket
const wss = new WebSocket.Server({ 
  server,
  path: '/notifications'
});

wss.on('connection', (ws, request) => {
  const parsedUrl = url.parse(request.url, true);
  const userEmail = parsedUrl.query.email;

  if (!userEmail) {
    ws.close(1008, 'Email requerido');
    return;
  }

  console.log(`Usuario conectado: ${userEmail}`);
  
  // Almacenar la conexión
  connections.set(userEmail, ws);

  // Manejar mensajes del cliente
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'MARK_AS_READ':
          console.log(`Notificación ${data.notificationId} marcada como leída por ${userEmail}`);
          break;
          
        case 'DELETE_NOTIFICATION':
          console.log(`Notificación ${data.notificationId} eliminada por ${userEmail}`);
          break;
          
        case 'PING':
          // Responder al ping del cliente
          ws.send(JSON.stringify({ type: 'PONG' }));
          break;
          
        default:
          console.log('Mensaje WebSocket no reconocido:', data);
      }
    } catch (error) {
      console.error('Error al procesar mensaje WebSocket:', error);
    }
  });

  // Manejar desconexión
  ws.on('close', () => {
    console.log(`Usuario desconectado: ${userEmail}`);
    connections.delete(userEmail);
  });

  // Manejar errores
  ws.on('error', (error) => {
    console.error(`Error WebSocket para ${userEmail}:`, error);
    connections.delete(userEmail);
  });

  // Enviar mensaje de bienvenida
  ws.send(JSON.stringify({
    type: 'CONNECTION_ESTABLISHED',
    message: 'Conectado al servidor de notificaciones',
    timestamp: new Date().toISOString()
  }));
});

// Función para limpiar conexiones muertas cada 30 segundos
setInterval(() => {
  connections.forEach((ws, userEmail) => {
    if (ws.readyState === WebSocket.CLOSED) {
      connections.delete(userEmail);
      console.log(`Limpiando conexión cerrada: ${userEmail}`);
    }
  });
}, 30000);

// Iniciar el servidor
const PORT = process.env.WS_PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor WebSocket iniciado en puerto ${PORT}`);
  console.log(`Endpoint: ws://localhost:${PORT}/notifications`);
});

// Funciones para uso externo (si se importa como módulo)
function sendNotificationToUser(userEmail, notification) {
  const ws = connections.get(userEmail);
  
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify({
        type: 'NEW_NOTIFICATION',
        notification: notification,
        timestamp: new Date().toISOString()
      }));
      console.log(`Notificación enviada a ${userEmail}`);
      return true;
    } catch (error) {
      console.error(`Error al enviar notificación a ${userEmail}:`, error);
      connections.delete(userEmail);
      return false;
    }
  }
  
  return false;
}

function getConnectedUsers() {
  return Array.from(connections.keys());
}

function broadcastToAll(message) {
  let sentCount = 0;
  
  connections.forEach((ws, userEmail) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({
          ...message,
          timestamp: new Date().toISOString()
        }));
        sentCount++;
      } catch (error) {
        console.error(`Error al enviar broadcast a ${userEmail}:`, error);
        connections.delete(userEmail);
      }
    } else {
      connections.delete(userEmail);
    }
  });
  
  console.log(`Broadcast enviado a ${sentCount} usuarios`);
  return sentCount;
}

// Manejar cierre graceful
process.on('SIGTERM', () => {
  console.log('Cerrando servidor WebSocket...');
  wss.close(() => {
    server.close(() => {
      console.log('Servidor WebSocket cerrado');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('Cerrando servidor WebSocket...');
  wss.close(() => {
    server.close(() => {
      console.log('Servidor WebSocket cerrado');
      process.exit(0);
    });
  });
});

module.exports = {
  sendNotificationToUser,
  getConnectedUsers,
  broadcastToAll
};
