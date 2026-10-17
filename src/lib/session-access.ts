import { prisma } from './prisma';

export async function canAccessSession(userId: string, userRole: string, sessionId: string): Promise<boolean> {
    if (userRole === "SUPERADMIN") {
        return true;
    }

    // Check if session belongs to user (ownership)
    const session = await prisma.session.findFirst({
        where: {
            OR: [
                { id: sessionId, userId },
                { sessionId: sessionId, userId }
            ]
        }
    });

    if (session) return true;

    // Check if user has shared access
    const dbSession = await prisma.session.findFirst({
        where: {
            OR: [
                { id: sessionId },
                { sessionId: sessionId }
            ]
        },
        select: { id: true }
    });

    if (!dbSession) return false;

    const sharedAccess = await prisma.sessionAccess.findUnique({
        where: {
            sessionId_userId: {
                sessionId: dbSession.id,
                userId
            }
        }
    });

    return !!sharedAccess;
}
