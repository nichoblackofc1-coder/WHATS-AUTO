import { Server } from "socket.io";
import { logger } from "../lib/logger";
import { getToken } from "next-auth/jwt";
import { canAccessSession } from "../lib/session-access";
import { prisma } from "../lib/prisma";

export function setupSocket(io: Server) {
  io.use(async (socket, next) => {
    try {
      const headers = new Headers();
      if (socket.request.headers.cookie) headers.set("cookie", socket.request.headers.cookie);
      const token = await getToken({
        req: { headers },
        secret: process.env.AUTH_SECRET!,
        secureCookie: (process.env.AUTH_URL || process.env.NEXTAUTH_URL || process.env.BASE_URL || "").startsWith("https://"),
      });
      if (!token?.id || typeof token.id !== "string") return next(new Error("Unauthorized"));
      const user = await prisma.user.findUnique({ where: { id: token.id }, select: { id: true, role: true } });
      if (!user) return next(new Error("Unauthorized"));
      socket.data.user = user;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });
  io.on("connection", (socket) => {
    logger.info("Socket", "Client connected:", socket.id);

    socket.on("disconnect", () => {
      logger.info("Socket", "Client disconnected:", socket.id);
    });

    // Handle joining room for specific WA session
    socket.on("join-session", async (sessionId: string) => {
      if (typeof sessionId !== "string" || !sessionId) return;
      try {
        const user = socket.data.user;
        if (!await canAccessSession(user.id, user.role, sessionId)) return;
        socket.join(sessionId);
        logger.debug("Socket", `Socket ${socket.id} joined session room: ${sessionId}`);
      } catch {
        logger.warn("Socket", "Session access check failed");
      }
    });

    // Handle joining user-specific room for notifications
    socket.on("join-user-room", (userId: string) => {
        if (userId !== socket.data.user.id) return;
        socket.join(`user:${userId}`);
        logger.debug("Socket", `Socket ${socket.id} joined user room: user:${userId}`);
    });
  });
}
