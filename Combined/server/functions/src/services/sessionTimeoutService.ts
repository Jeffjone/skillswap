import { db } from '../lib/firebase';
import { SessionService } from './sessionService';
import { auth } from '../lib/firebase';

export class SessionTimeoutService {
    private static readonly SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
    private static readonly WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes before timeout

    /**
     * Check if a session is about to timeout
     */
    static async checkSessionTimeout(sessionId: string): Promise<{ isExpiring: boolean; timeLeft: number; shouldLogout: boolean }> {
        const session = await SessionService.getSessionById(sessionId);
        if (!session) {
            return { isExpiring: false, timeLeft: 0, shouldLogout: true };
        }

        const lastActivity = session.lastActivity || session.startTime;
        const timeSinceLastActivity = Date.now() - lastActivity.getTime();
        const timeLeft = this.SESSION_TIMEOUT - timeSinceLastActivity;

        if (timeLeft <= 0) {
            // Force logout if session has expired
            await this.forceLogout(session.userId);
            return { isExpiring: false, timeLeft: 0, shouldLogout: true };
        }

        return {
            isExpiring: timeLeft <= this.WARNING_THRESHOLD,
            timeLeft: Math.max(0, timeLeft),
            shouldLogout: false
        };
    }

    /**
     * Force logout a user
     */
    private static async forceLogout(userId: string): Promise<void> {
        try {
            // Revoke all refresh tokens
            await auth.revokeRefreshTokens(userId);
            
            // End all active sessions
            const activeSessions = await SessionService.getActiveSessions(userId);
            await Promise.all(activeSessions.map(session => 
                SessionService.endSession(session.id)
            ));
        } catch (error) {
            console.error('Error during force logout:', error);
        }
    }

    /**
     * Update session last activity time
     */
    static async updateLastActivity(sessionId: string): Promise<void> {
        await db.collection('userSessions').doc(sessionId).update({
            lastActivity: new Date()
        });
    }

    /**
     * Get session timeout settings
     */
    static getTimeoutSettings() {
        return {
            timeout: this.SESSION_TIMEOUT,
            warningThreshold: this.WARNING_THRESHOLD
        };
    }
} 