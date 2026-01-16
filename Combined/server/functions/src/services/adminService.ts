import { firestore } from "firebase-admin";

const db = firestore();

export class AdminService {
    /**
     * Get all users (for admin panel)
     */
    static async getAllUsers(limit: number = 100): Promise<any[]> {
        const users = await db.collection('users')
            .limit(limit)
            .get();

        return users.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * Get user by ID
     */
    static async getUserById(userId: string): Promise<any | null> {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return null;
        }
        return {
            id: userDoc.id,
            ...userDoc.data()
        };
    }

    /**
     * Update user data (admin only)
     */
    static async updateUser(userId: string, updates: any): Promise<void> {
        await db.collection('users').doc(userId).update({
            ...updates,
            updatedAt: new Date()
        });
    }

    /**
     * Delete user
     */
    static async deleteUser(userId: string): Promise<void> {
        await db.collection('users').doc(userId).delete();
    }

    /**
     * Get platform statistics
     */
    static async getPlatformStats(): Promise<any> {
        const [usersSnapshot, sessionsSnapshot, ratingsSnapshot] = await Promise.all([
            db.collection('users').get(),
            db.collection('sessionRequests').get(),
            db.collection('ratings').get()
        ]);

        const totalUsers = usersSnapshot.size;
        const totalSessions = sessionsSnapshot.size;
        const totalRatings = ratingsSnapshot.size;

        // Calculate active users (users with sessions in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentSessions = sessionsSnapshot.docs.filter(doc => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            return createdAt >= thirtyDaysAgo;
        });

        const activeUserIds = new Set<string>();
        recentSessions.forEach(doc => {
            const data = doc.data();
            if (data.requesterId) activeUserIds.add(data.requesterId);
            if (data.recipientId) activeUserIds.add(data.recipientId);
        });

        // Calculate average rating
        let totalRating = 0;
        ratingsSnapshot.forEach(doc => {
            totalRating += doc.data().rating || 0;
        });
        const averageRating = ratingsSnapshot.size > 0 ? totalRating / ratingsSnapshot.size : 0;

        // Count completed sessions
        const completedSessions = sessionsSnapshot.docs.filter(doc => {
            return doc.data().status === 'completed';
        }).length;

        return {
            totalUsers,
            activeUsers: activeUserIds.size,
            totalSessions,
            completedSessions,
            totalRatings,
            averageRating: Math.round(averageRating * 10) / 10,
            pendingSessions: sessionsSnapshot.docs.filter(doc => doc.data().status === 'pending').length,
            acceptedSessions: sessionsSnapshot.docs.filter(doc => doc.data().status === 'accepted').length
        };
    }

    /**
     * Get recent activity
     */
    static async getRecentActivity(limit: number = 50): Promise<any[]> {
        const [sessions, ratings] = await Promise.all([
            db.collection('sessionRequests')
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get(),
            db.collection('ratings')
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get()
        ]);

        const activities: any[] = [];

        sessions.forEach(doc => {
            const data = doc.data();
            activities.push({
                type: 'session',
                id: doc.id,
                action: data.status,
                userId: data.requesterId,
                userName: data.requesterName,
                targetUserId: data.recipientId,
                targetUserName: data.recipientName,
                timestamp: data.createdAt,
                data: {
                    skillOffered: data.skillOfferedName,
                    skillSought: data.skillSoughtName
                }
            });
        });

        ratings.forEach(doc => {
            const data = doc.data();
            activities.push({
                type: 'rating',
                id: doc.id,
                action: 'rated',
                userId: data.raterId,
                userName: data.raterName,
                targetUserId: data.rateeId,
                targetUserName: data.rateeName,
                timestamp: data.createdAt,
                data: {
                    rating: data.rating,
                    skill: data.skillName
                }
            });
        });

        // Sort by timestamp and return most recent
        return activities
            .sort((a, b) => {
                const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
                const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
                return timeB - timeA;
            })
            .slice(0, limit);
    }

    /**
     * Check if user is admin
     */
    static async isAdmin(userId: string): Promise<boolean> {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return false;
        }
        const userData = userDoc.data();
        // Check if user has admin role or is marked as admin
        return userData?.immutable?.memberType === 'ContentManager' || 
               userData?.isAdmin === true ||
               userData?.role === 'admin';
    }
}
