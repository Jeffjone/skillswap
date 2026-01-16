import { db } from '../lib/firebase';
import * as admin from 'firebase-admin';

export interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    type: 'team' | 'challenge' | 'system';
    teamId: string;
    createdBy: string;
    isRecurring: boolean;
    recurrenceRule?: string;
    participants?: string[];
}

export class CalendarService {
    private static readonly CALENDAR_COLLECTION = 'calendarEvents';

    /**
     * Get team events for dashboard
     */
    static async getTeamEventsForDashboard(userId: string): Promise<CalendarEvent[]> {
        // Get user's teams
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return [];
        }

        const userData = userDoc.data();
        if (!userData?.teamId) {
            return [];
        }

        const now = new Date();
        const oneWeekLater = new Date();
        oneWeekLater.setDate(oneWeekLater.getDate() + 7);

        return this.getTeamEvents(userData.teamId, now, oneWeekLater);
    }

    /**
     * Get team events
     */
    static async getTeamEvents(
        teamId: string,
        startDate: Date,
        endDate: Date
    ): Promise<CalendarEvent[]> {
        const events = await db.collection(this.CALENDAR_COLLECTION)
            .where('teamId', '==', teamId)
            .where('startTime', '>=', startDate)
            .where('startTime', '<=', endDate)
            .orderBy('startTime', 'asc')
            .get();

        return events.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as CalendarEvent[];
    }

    /**
     * Create a new team event
     */
    static async createTeamEvent(event: Omit<CalendarEvent, 'id'>): Promise<string> {
        const docRef = await db.collection(this.CALENDAR_COLLECTION).add(event);
        return docRef.id;
    }

    /**
     * Update a team event
     */
    static async updateTeamEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<void> {
        await db.collection(this.CALENDAR_COLLECTION).doc(eventId).update(updates);
    }

    /**
     * Delete a team event
     */
    static async deleteTeamEvent(eventId: string): Promise<void> {
        await db.collection(this.CALENDAR_COLLECTION).doc(eventId).delete();
    }

    /**
     * Add participant to event
     */
    static async addParticipant(eventId: string, userId: string): Promise<void> {
        await db.collection(this.CALENDAR_COLLECTION).doc(eventId).update({
            participants: admin.firestore.FieldValue.arrayUnion(userId)
        });
    }

    /**
     * Remove participant from event
     */
    static async removeParticipant(eventId: string, userId: string): Promise<void> {
        await db.collection(this.CALENDAR_COLLECTION).doc(eventId).update({
            participants: admin.firestore.FieldValue.arrayRemove(userId)
        });
    }
} 