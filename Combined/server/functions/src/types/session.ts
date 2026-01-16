export interface UserSession {
    id: string;
    userId: string;
    startTime: Date;
    endTime?: Date;
    duration?: number; // in minutes
    lastActivity?: Date;
    deviceInfo?: {
        userAgent?: string;
        platform?: string;
        language?: string;
    };
}

export interface UserStreak {
    userId: string;
    currentStreak: number;
    longestStreak: number;
    lastLoginDate: Date;
    loginHistory: Array<{
        date: Date;
        sessions: Array<{
            userId: string;
            startTime: Date;
        }>;
    }>;
}

export interface SessionStats {
    totalSessions: number;
    totalDuration: number; // in minutes
    averageSessionDuration: number; // in minutes
    lastActive: Date;
    streakInfo: UserStreak;
} 