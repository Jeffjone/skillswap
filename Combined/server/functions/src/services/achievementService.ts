import { db } from '../lib/firebase';
import { UserRole } from '../types/user';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'weekly' | 'monthly' | 'special';
    points: number;
    icon: string;
    requirements: {
        type: 'login' | 'challenge' | 'team' | 'content' | 'custom';
        count: number;
        period?: 'day' | 'week' | 'month';
    };
    role: UserRole;
}

export interface UserAchievement {
    userId: string;
    achievementId: string;
    progress: number;
    completed: boolean;
    completedAt?: Date;
    lastUpdated: Date;
}

export class AchievementService {
    private static readonly ACHIEVEMENTS_COLLECTION = 'achievements';
    private static readonly USER_ACHIEVEMENTS_COLLECTION = 'userAchievements';

    /**
     * Get all achievements for a role
     */
    static async getAchievements(role: UserRole): Promise<Achievement[]> {
        const achievements = await db.collection(this.ACHIEVEMENTS_COLLECTION)
            .where('role', '==', role)
            .get();

        return achievements.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Achievement[];
    }

    /**
     * Get user's achievements
     */
    static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
        const achievements = await db.collection(this.USER_ACHIEVEMENTS_COLLECTION)
            .where('userId', '==', userId)
            .get();

        return achievements.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as Omit<UserAchievement, 'id'>
        })) as UserAchievement[];
    }

    /**
     * Update achievement progress
     */
    static async updateProgress(
        userId: string,
        achievementId: string,
        progress: number
    ): Promise<void> {
        const achievement = await db.collection(this.ACHIEVEMENTS_COLLECTION)
            .doc(achievementId)
            .get();

        if (!achievement.exists) {
            throw new Error('Achievement not found');
        }

        const achievementData = achievement.data() as Achievement;
        const isCompleted = progress >= achievementData.requirements.count;

        await db.collection(this.USER_ACHIEVEMENTS_COLLECTION)
            .doc(`${userId}_${achievementId}`)
            .set({
                userId,
                achievementId,
                progress,
                completed: isCompleted,
                completedAt: isCompleted ? new Date() : null,
                lastUpdated: new Date()
            }, { merge: true });
    }

    /**
     * Get dashboard achievements
     */
    static async getDashboardAchievements(userId: string, role: UserRole): Promise<{
        recent: UserAchievement[];
        inProgress: UserAchievement[];
        completed: UserAchievement[];
    }> {
        const [, userAchievements] = await Promise.all([
            this.getAchievements(role),
            this.getUserAchievements(userId)
        ]);

        const recent = userAchievements
            .filter(ua => ua.completed)
            .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
            .slice(0, 3);

        const inProgress = userAchievements
            .filter(ua => !ua.completed)
            .sort((a, b) => b.progress - a.progress)
            .slice(0, 3);

        const completed = userAchievements
            .filter(ua => ua.completed)
            .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));

        return { recent, inProgress, completed };
    }
} 