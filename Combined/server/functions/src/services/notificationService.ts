import { db } from '../lib/firebase';
import { RoleNotificationSettings, NotificationPreference } from '../types/notifications';

export class NotificationService {
    private static readonly NOTIFICATIONS_COLLECTION = 'notificationPreferences';

    /**
     * Get notification preferences for a user
     */
    static async getPreferences(userId: string): Promise<RoleNotificationSettings | null> {
        const doc = await db.collection(this.NOTIFICATIONS_COLLECTION).doc(userId).get();
        return doc.exists ? doc.data() as RoleNotificationSettings : null;
    }

    /**
     * Update notification preferences for a user
     */
    static async updatePreferences(
        userId: string,
        role: RoleNotificationSettings['role'],
        preferences: Partial<RoleNotificationSettings['preferences']>
    ): Promise<void> {
        const docRef = db.collection(this.NOTIFICATIONS_COLLECTION).doc(userId);
        const doc = await docRef.get();

        if (!doc.exists) {
            // Create new preferences
            const newPreferences: RoleNotificationSettings = {
                userId,
                role,
                preferences: {
                    dailyCheckIn: this.getDefaultPreference(),
                    teamUpdates: this.getDefaultPreference(),
                    challengeReminders: this.getDefaultPreference(),
                    goalReminders: this.getDefaultPreference(),
                    contentApproval: this.getDefaultPreference(),
                    teamMessages: this.getDefaultPreference(),
                    ...preferences
                },
                lastUpdated: new Date()
            };
            await docRef.set(newPreferences);
            return;
        }

        // Update existing preferences
        const currentData = doc.data() as RoleNotificationSettings;
        await docRef.update({
            role,
            preferences: {
                ...currentData.preferences,
                ...preferences
            },
            lastUpdated: new Date()
        });
    }

    /**
     * Get default notification preference
     */
    private static getDefaultPreference(): NotificationPreference {
        return {
            channel: 'email',
            frequency: 'daily',
            time: {
                hour: 9, // 9 AM
                minute: 0,
                timezone: 'UTC'
            },
            enabled: true
        };
    }

    /**
     * Get users who should receive notifications for a specific type
     */
    static async getUsersForNotification(
        notificationType: keyof RoleNotificationSettings['preferences']
    ): Promise<string[]> {
        const now = new Date();
        const currentHour = now.getUTCHours();
        const currentMinute = now.getUTCMinutes();

        const snapshot = await db.collection(this.NOTIFICATIONS_COLLECTION)
            .where(`preferences.${notificationType}.enabled`, '==', true)
            .where(`preferences.${notificationType}.time.hour`, '==', currentHour)
            .where(`preferences.${notificationType}.time.minute`, '==', currentMinute)
            .get();

        return snapshot.docs.map(doc => doc.id);
    }

    /**
     * Get role-specific notification preferences
     */
    static getRoleDefaultPreferences(role: RoleNotificationSettings['role']): RoleNotificationSettings['preferences'] {
        const basePreferences = {
            dailyCheckIn: this.getDefaultPreference(),
            teamUpdates: this.getDefaultPreference(),
            challengeReminders: this.getDefaultPreference(),
            goalReminders: this.getDefaultPreference(),
            teamMessages: this.getDefaultPreference()
        };

        switch (role) {
            case 'teamCaptain':
                return {
                    ...basePreferences,
                    contentApproval: {
                        ...this.getDefaultPreference(),
                        frequency: 'daily',
                        time: {
                            hour: 10,
                            minute: 0,
                            timezone: 'UTC'
                        }
                    }
                };
            case 'contentManager':
                return {
                    ...basePreferences,
                    contentApproval: {
                        ...this.getDefaultPreference(),
                        frequency: 'daily',
                        time: {
                            hour: 10,
                            minute: 0,
                            timezone: 'UTC'
                        }
                    }
                };
            default:
                return basePreferences;
        }
    }
} 