import { db } from '../lib/firebase';
import { UserSession, UserStreak, SessionStats } from '../types/session';
import * as admin from 'firebase-admin';

export class SessionService {
    private static readonly SESSIONS_COLLECTION = 'userSessions';
    private static readonly STREAKS_COLLECTION = 'userStreaks';

    /**
     * Get a session by ID
     */
    static async getSessionById(sessionId: string): Promise<UserSession | null> {
        const session = await db.collection(this.SESSIONS_COLLECTION).doc(sessionId).get();
        return session.exists ? session.data() as UserSession : null;
    }

    /**
     * Start a new user session
     */
    static async startSession(userId: string, deviceInfo?: UserSession['deviceInfo']): Promise<string> {
        const session: Omit<UserSession, 'id'> = {
            userId,
            startTime: new Date(),
            deviceInfo
        };

        const sessionRef = await db.collection(this.SESSIONS_COLLECTION).add(session);
        return sessionRef.id;
    }

    /**
     * End an active user session
     */
    static async endSession(sessionId: string): Promise<void> {
        const sessionRef = db.collection(this.SESSIONS_COLLECTION).doc(sessionId);
        const session = await sessionRef.get();
        
        if (!session.exists) {
            throw new Error('Session not found');
        }

        const sessionData = session.data() as UserSession;
        const endTime = new Date();
        const duration = Math.round((endTime.getTime() - sessionData.startTime.getTime()) / (1000 * 60)); // Convert to minutes

        await sessionRef.update({
            endTime,
            duration
        });

        // Update streak information
        await this.updateStreak(sessionData.userId, sessionData.startTime);
    }

    /**
     * Update user streak information
     */
    private static async updateStreak(userId: string, loginDate: Date): Promise<void> {
        const streakRef = db.collection(this.STREAKS_COLLECTION).doc(userId);
        const streakDoc = await streakRef.get();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const loginDay = new Date(loginDate);
        loginDay.setHours(0, 0, 0, 0);

        if (!streakDoc.exists) {
            // Create new streak record
            const newStreak: UserStreak = {
                userId,
                currentStreak: 1,
                longestStreak: 1,
                lastLoginDate: loginDate,
                loginHistory: [{
                    date: loginDay,
                    sessions: []
                }]
            };
            await streakRef.set(newStreak);
            return;
        }

        const streakData = streakDoc.data() as UserStreak;
        const lastLoginDay = new Date(streakData.lastLoginDate);
        lastLoginDay.setHours(0, 0, 0, 0);

        // Calculate days difference
        const daysDiff = Math.floor((loginDay.getTime() - lastLoginDay.getTime()) / (1000 * 60 * 60 * 24));

        let currentStreak = streakData.currentStreak;
        if (daysDiff === 1) {
            // Consecutive day
            currentStreak++;
        } else if (daysDiff > 1) {
            // Streak broken
            currentStreak = 1;
        }

        const longestStreak = Math.max(currentStreak, streakData.longestStreak);

        // Update login history
        const loginHistory = [...streakData.loginHistory];
        const existingDayIndex = loginHistory.findIndex(entry => 
            entry.date.getTime() === loginDay.getTime()
        );

        if (existingDayIndex >= 0) {
            // Add session to existing day
            loginHistory[existingDayIndex].sessions.push({
                userId,
                startTime: loginDate
            });
        } else {
            // Add new day entry
            loginHistory.push({
                date: loginDay,
                sessions: [{
                    userId,
                    startTime: loginDate
                }]
            });
        }

        // Keep only last 30 days of history
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const filteredHistory = loginHistory.filter(entry => entry.date >= thirtyDaysAgo);

        await streakRef.update({
            currentStreak,
            longestStreak,
            lastLoginDate: loginDate,
            loginHistory: filteredHistory
        });
    }

    /**
     * Get user session statistics
     */
    static async getSessionStats(userId: string): Promise<SessionStats> {
        const [sessionsSnapshot, streakDoc] = await Promise.all([
            db.collection(this.SESSIONS_COLLECTION)
                .where('userId', '==', userId)
                .get(),
            db.collection(this.STREAKS_COLLECTION)
                .doc(userId)
                .get()
        ]);

        const sessions = sessionsSnapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => doc.data() as UserSession);
        const streakData = streakDoc.exists ? streakDoc.data() as UserStreak : null;

        const totalSessions = sessions.length;
        const totalDuration = sessions.reduce((sum: number, session: UserSession) => sum + (session.duration || 0), 0);
        const averageSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
        const lastActive = sessions.length > 0 
            ? new Date(Math.max(...sessions.map((s: UserSession) => s.endTime?.getTime() || s.startTime.getTime())))
            : new Date();

        return {
            totalSessions,
            totalDuration,
            averageSessionDuration,
            lastActive,
            streakInfo: streakData || {
                userId,
                currentStreak: 0,
                longestStreak: 0,
                lastLoginDate: new Date(),
                loginHistory: []
            }
        };
    }

    /**
     * Get active sessions for a user
     */
    static async getActiveSessions(userId: string): Promise<UserSession[]> {
        const sessionsSnapshot = await db.collection(this.SESSIONS_COLLECTION)
            .where('userId', '==', userId)
            .where('endTime', '==', null)
            .get();

        return sessionsSnapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => doc.data() as UserSession);
    }
} 