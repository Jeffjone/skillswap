/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { initializeApp } from "firebase-admin/app";
import * as functions from 'firebase-functions';
import { SessionService } from './services/sessionService';
import { NotificationService } from './services/notificationService';
import { db } from './lib/firebase';
import * as admin from 'firebase-admin';
import { RoleNotificationSettings } from './types/notifications';
import { SessionTimeoutService } from './services/sessionTimeoutService';
import { CalendarService, CalendarEvent } from './services/calendarService';
import { AchievementService } from './services/achievementService';
import { FAQService } from './services/faqService';
import { UserRole } from './types/user';
import { SessionRequestService } from './services/sessionRequestService';
import { SessionRequest, SessionStatus } from './types/sessionRequest';
import { RatingService } from './services/ratingService';
import { Rating } from './types/rating';
import { AdminService } from './services/adminService';

initializeApp();

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

import {
    onUserDelete,
    onCreateNewUser,
    setupAccount,
    updateUser,
} from "./member";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export { onCreateNewUser, onUserDelete, updateUser, setupAccount };

// Session tracking endpoints
export const startSession = functions.https.onCall(async (data: { deviceInfo?: any }, context: functions.https.CallableContext) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const sessionId = await SessionService.startSession(context.auth.uid, data.deviceInfo);
        return { sessionId };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to start session');
    }
});

export const endSession = functions.https.onCall(async (data: { sessionId: string }, context: functions.https.CallableContext) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    if (!data.sessionId) {
        throw new functions.https.HttpsError('invalid-argument', 'Session ID is required');
    }

    try {
        await SessionService.endSession(data.sessionId);
        return { success: true };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to end session');
    }
});

export const getSessionStats = functions.https.onCall(async (data: {}, context: functions.https.CallableContext) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const stats = await SessionService.getSessionStats(context.auth.uid);
        return stats;
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to get session stats');
    }
});

// Cleanup expired sessions (runs every hour)
export const cleanupSessions = functions.pubsub.schedule('every 1 hours').onRun(async () => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const expiredSessions = await db.collection('userSessions')
        .where('startTime', '<', oneDayAgo)
        .where('endTime', '==', null)
        .get();

    const batch = db.batch();
    expiredSessions.docs.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
        batch.update(doc.ref, {
            endTime: oneDayAgo,
            duration: Math.round((oneDayAgo.getTime() - doc.data().startTime.toDate().getTime()) / (1000 * 60))
        });
    });

    await batch.commit();
});

// Notification preference endpoints
export const getNotificationPreferences = functions.https.onCall(async (data: {}, context: functions.https.CallableContext) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const preferences = await NotificationService.getPreferences(context.auth.uid);
        return preferences;
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to get notification preferences');
    }
});

export const updateNotificationPreferences = functions.https.onCall(async (
    data: { 
        role: RoleNotificationSettings['role'],
        preferences: Partial<RoleNotificationSettings['preferences']>
    }, 
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    if (!data.role || !data.preferences) {
        throw new functions.https.HttpsError('invalid-argument', 'Role and preferences are required');
    }

    try {
        await NotificationService.updatePreferences(
            context.auth.uid,
            data.role,
            data.preferences
        );
        return { success: true };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to update notification preferences');
    }
});

// Scheduled notification sender (runs every minute)
export const sendScheduledNotifications = functions.pubsub.schedule('every 1 minutes').onRun(async () => {
    const notificationTypes: Array<keyof RoleNotificationSettings['preferences']> = [
        'dailyCheckIn',
        'teamUpdates',
        'challengeReminders',
        'goalReminders',
        'contentApproval',
        'teamMessages'
    ];

    for (const type of notificationTypes) {
        const userIds = await NotificationService.getUsersForNotification(type);
        
        for (const userId of userIds) {
            const userDoc = await db.collection('users').doc(userId).get();
            if (!userDoc.exists) continue;

            const userData = userDoc.data();
            if (!userData?.email) continue;

            // Send email notification
            await sendEmailNotification(userData.email, type);
        }
    }
});

async function sendEmailNotification(email: string, type: string) {
    // TODO: Implement email sending logic
    // This would typically use a service like SendGrid or Firebase Extensions
    console.log(`Sending ${type} notification to ${email}`);
}

// Session timeout endpoints
export const checkSessionTimeout = functions.https.onCall(async (data: { sessionId: string }, context: functions.https.CallableContext) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const result = await SessionTimeoutService.checkSessionTimeout(data.sessionId);
        if (result.shouldLogout) {
            // Force client-side logout
            return { shouldLogout: true };
        }
        return {
            isExpiring: result.isExpiring,
            timeLeft: result.timeLeft,
            shouldLogout: false
        };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to check session timeout');
    }
});

export const updateSessionActivity = functions.https.onCall(async (data: { sessionId: string }, context: functions.https.CallableContext) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        await SessionTimeoutService.updateLastActivity(data.sessionId);
        return { success: true };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to update session activity');
    }
});

// Calendar endpoints
export const getTeamCalendarEvents = functions.https.onCall(async (data: {}, context: functions.https.CallableContext) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const events = await CalendarService.getTeamEventsForDashboard(context.auth.uid);
        return events;
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to get team calendar events');
    }
});

export const createTeamEvent = functions.https.onCall(async (
    data: Omit<CalendarEvent, 'id'>,
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const eventId = await CalendarService.createTeamEvent({
            ...data,
            createdBy: context.auth.uid
        });
        return { eventId };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to create team event');
    }
});

// Achievement endpoints
export const getUserAchievements = functions.https.onCall(async (data: {}, context: functions.https.CallableContext) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const userDoc = await db.collection('users').doc(context.auth.uid).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }

        const userData = userDoc.data();
        if (!userData) {
            throw new functions.https.HttpsError('not-found', 'User data not found');
        }

        const [achievements, userAchievements] = await Promise.all([
            AchievementService.getAchievements(userData.role as UserRole),
            AchievementService.getUserAchievements(context.auth.uid)
        ]);

        return {
            achievements,
            userAchievements
        };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to get user achievements');
    }
});

// FAQ endpoints
export const getFAQs = functions.https.onCall(async (data: {}, context: functions.https.CallableContext) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const userDoc = await db.collection('users').doc(context.auth.uid).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }

        const userData = userDoc.data();
        if (!userData) {
            throw new functions.https.HttpsError('not-found', 'User data not found');
        }

        const [faqs, categories] = await Promise.all([
            FAQService.getFAQs(userData.role as UserRole),
            FAQService.getCategories(userData.role as UserRole)
        ]);

        return {
            faqs,
            categories
        };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to get FAQs');
    }
});

export const searchFAQs = functions.https.onCall(async (
    data: { query: string },
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const userDoc = await db.collection('users').doc(context.auth.uid).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }

        const userData = userDoc.data();
        if (!userData) {
            throw new functions.https.HttpsError('not-found', 'User data not found');
        }

        const faqs = await FAQService.searchFAQs(userData.role as UserRole, data.query);
        return faqs;
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to search FAQs');
    }
});

// Session Request endpoints
export const createSessionRequest = functions.https.onCall(async (
    data: Omit<SessionRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const userDoc = await db.collection('users').doc(context.auth.uid).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }

        const userData = userDoc.data();
        const recipientDoc = await db.collection('users').doc(data.recipientId).get();
        if (!recipientDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Recipient not found');
        }

        const recipientData = recipientDoc.data();

        // Convert proposedDate to Date object if it's a string or timestamp
        let proposedDateObj: Date;
        if (data.proposedDate instanceof Date) {
            proposedDateObj = data.proposedDate;
        } else if (typeof data.proposedDate === 'string') {
            proposedDateObj = new Date(data.proposedDate);
        } else if (data.proposedDate && typeof data.proposedDate === 'object' && 'seconds' in (data.proposedDate as any)) {
            // Firestore Timestamp format
            proposedDateObj = new Date((data.proposedDate as any).seconds * 1000);
        } else {
            proposedDateObj = new Date(data.proposedDate as any);
        }

        // Validate the date is in the future
        if (proposedDateObj <= new Date()) {
            throw new functions.https.HttpsError('invalid-argument', 'Proposed date must be in the future');
        }

        const sessionRequest: Omit<SessionRequest, 'id' | 'createdAt' | 'updatedAt'> = {
            ...data,
            proposedDate: proposedDateObj,
            requesterId: context.auth.uid,
            requesterName: userData?.displayName || '',
            requesterEmail: userData?.email || '',
            recipientName: recipientData?.displayName || '',
            recipientEmail: recipientData?.email || '',
            status: SessionStatus.PENDING,
        };

        const requestId = await SessionRequestService.createSessionRequest(sessionRequest);
        return { requestId };
    } catch (error: any) {
        console.error('Error creating session request:', error);
        // If it's already an HttpsError, re-throw it
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', error?.message || 'Failed to create session request');
    }
});

export const getUserSessionRequests = functions.https.onCall(async (
    data: {},
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const requests = await SessionRequestService.getUserSessionRequests(context.auth.uid);
        return requests;
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to get session requests');
    }
});

export const getSessionRequestsByStatus = functions.https.onCall(async (
    data: { status: SessionStatus },
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const requests = await SessionRequestService.getSessionRequestsByStatus(
            context.auth.uid,
            data.status
        );
        return requests;
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to get session requests');
    }
});

export const updateSessionRequestStatus = functions.https.onCall(async (
    data: { requestId: string; status: SessionStatus },
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        await SessionRequestService.updateSessionRequestStatus(
            data.requestId,
            data.status,
            context.auth.uid
        );
        return { success: true };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to update session request status');
    }
});

export const getUserSessionSchedules = functions.https.onCall(async (
    data: {},
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const schedules = await SessionRequestService.getUserSessionSchedules(context.auth.uid);
        return schedules;
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to get session schedules');
    }
});

export const completeSession = functions.https.onCall(async (
    data: { scheduleId: string },
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        await SessionRequestService.completeSession(data.scheduleId, context.auth.uid);
        return { success: true };
    } catch (error: any) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', error?.message || 'Failed to complete session');
    }
});

export const cancelSessionSchedule = functions.https.onCall(async (
    data: { scheduleId: string },
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    if (!data.scheduleId) {
        throw new functions.https.HttpsError('invalid-argument', 'Schedule ID is required');
    }

    try {
        await SessionRequestService.cancelSessionSchedule(data.scheduleId, context.auth.uid);
        return { success: true };
    } catch (error: any) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', error?.message || 'Failed to cancel session schedule');
    }
});

// Rating endpoints
export const createRating = functions.https.onCall(async (
    data: Omit<Rating, 'id' | 'createdAt'>,
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        // Verify user hasn't already rated this session
        const hasRated = await RatingService.hasUserRatedSession(
            context.auth.uid,
            data.sessionRequestId
        );

        if (hasRated) {
            throw new functions.https.HttpsError('already-exists', 'You have already rated this session');
        }

        // Verify raterId matches authenticated user
        if (data.raterId !== context.auth.uid) {
            throw new functions.https.HttpsError('permission-denied', 'You can only rate as yourself');
        }

        const ratingData: Omit<Rating, 'id' | 'createdAt'> = {
            ...data,
            raterId: context.auth.uid
        };
        const ratingId = await RatingService.createRating(ratingData);
        return { ratingId };
    } catch (error: any) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to create rating');
    }
});

export const getUserRatings = functions.https.onCall(async (
    data: { userId: string },
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const ratings = await RatingService.getUserRatings(data.userId);
        return { ratings };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to get user ratings');
    }
});

export const getUserRatingSummary = functions.https.onCall(async (
    data: { userId: string },
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const summary = await RatingService.getUserRatingSummary(data.userId);
        return summary;
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to get rating summary');
    }
});

// Admin endpoints
export const getPlatformStats = functions.https.onCall(async (
    data: {},
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const isAdmin = await AdminService.isAdmin(context.auth.uid);
        if (!isAdmin) {
            throw new functions.https.HttpsError('permission-denied', 'Only admins can access this');
        }

        const stats = await AdminService.getPlatformStats();
        return stats;
    } catch (error: any) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to get platform stats');
    }
});

export const getAllUsers = functions.https.onCall(async (
    data: { limit?: number },
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const isAdmin = await AdminService.isAdmin(context.auth.uid);
        if (!isAdmin) {
            throw new functions.https.HttpsError('permission-denied', 'Only admins can access this');
        }

        const users = await AdminService.getAllUsers(data.limit || 100);
        return { users };
    } catch (error: any) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to get users');
    }
});

export const getRecentActivity = functions.https.onCall(async (
    data: { limit?: number },
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const isAdmin = await AdminService.isAdmin(context.auth.uid);
        if (!isAdmin) {
            throw new functions.https.HttpsError('permission-denied', 'Only admins can access this');
        }

        const activity = await AdminService.getRecentActivity(data.limit || 50);
        return { activity };
    } catch (error: any) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to get recent activity');
    }
});

export const adminUpdateUser = functions.https.onCall(async (
    data: { userId: string; updates: any },
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const isAdmin = await AdminService.isAdmin(context.auth.uid);
        if (!isAdmin) {
            throw new functions.https.HttpsError('permission-denied', 'Only admins can update users');
        }

        await AdminService.updateUser(data.userId, data.updates);
        return { success: true };
    } catch (error: any) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to update user');
    }
});

export const adminDeleteUser = functions.https.onCall(async (
    data: { userId: string },
    context: functions.https.CallableContext
) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        const isAdmin = await AdminService.isAdmin(context.auth.uid);
        if (!isAdmin) {
            throw new functions.https.HttpsError('permission-denied', 'Only admins can delete users');
        }

        await AdminService.deleteUser(data.userId);
        return { success: true };
    } catch (error: any) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to delete user');
    }
});
