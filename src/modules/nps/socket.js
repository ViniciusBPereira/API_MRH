import { Server } from "socket.io";

/**
 * Inicializa o Socket.IO
 */
export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*", // depois você pode restringir
    },
  });

  io.on("connection", (socket) => {
    console.log(`[SOCKET] Cliente conectado: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`[SOCKET] Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
}