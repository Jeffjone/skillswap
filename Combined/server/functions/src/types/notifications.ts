export type NotificationChannel = 'email' | 'push' | 'inApp';

export type NotificationFrequency = 'daily' | 'weekly' | 'never';

export interface NotificationTime {
    hour: number; // 0-23
    minute: number; // 0-59
    timezone: string;
}

export interface NotificationPreference {
    channel: NotificationChannel;
    frequency: NotificationFrequency;
    time: NotificationTime;
    enabled: boolean;
}

export interface RoleNotificationSettings {
    userId: string;
    role: 'member' | 'teamCaptain' | 'contentManager';
    preferences: {
        dailyCheckIn?: NotificationPreference;
        teamUpdates?: NotificationPreference;
        challengeReminders?: NotificationPreference;
        goalReminders?: NotificationPreference;
        contentApproval?: NotificationPreference;
        teamMessages?: NotificationPreference;
    };
    lastUpdated: Date;
} 