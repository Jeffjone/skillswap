import { firestore } from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { SessionRequest, SessionStatus } from "../types/sessionRequest";

const db = firestore();

export class SessionRequestService {
    /**
     * Create a new session request
     */
    static async createSessionRequest(request: Omit<SessionRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const sessionRequest: Omit<SessionRequest, 'id'> = {
            ...request,
            createdAt: FieldValue.serverTimestamp() as any,
            updatedAt: FieldValue.serverTimestamp() as any,
        };

        const docRef = await db.collection('sessionRequests').add(sessionRequest);
        return docRef.id;
    }

    /**
     * Get session requests for a user (as requester or recipient)
     */
    static async getUserSessionRequests(userId: string): Promise<SessionRequest[]> {
        const [sentRequests, receivedRequests] = await Promise.all([
            db.collection('sessionRequests')
                .where('requesterId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get(),
            db.collection('sessionRequests')
                .where('recipientId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get()
        ]);

        const sent = sentRequests.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SessionRequest));

        const received = receivedRequests.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SessionRequest));

        return [...sent, ...received];
    }

    /**
     * Get session requests by status
     */
    static async getSessionRequestsByStatus(userId: string, status: SessionStatus): Promise<SessionRequest[]> {
        const [sentRequests, receivedRequests] = await Promise.all([
            db.collection('sessionRequests')
                .where('requesterId', '==', userId)
                .where('status', '==', status)
                .orderBy('createdAt', 'desc')
                .get(),
            db.collection('sessionRequests')
                .where('recipientId', '==', userId)
                .where('status', '==', status)
                .orderBy('createdAt', 'desc')
                .get()
        ]);

        const sent = sentRequests.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SessionRequest));

        const received = receivedRequests.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SessionRequest));

        return [...sent, ...received];
    }

    /**
     * Update session request status
     */
    static async updateSessionRequestStatus(
        requestId: string,
        status: SessionStatus,
        userId: string
    ): Promise<void> {
        const requestDoc = await db.collection('sessionRequests').doc(requestId).get();
        if (!requestDoc.exists) {
            throw new Error('Session request not found');
        }

        const requestData = requestDoc.data() as SessionRequest;
        
        // Only recipient can accept/reject, requester can cancel
        if (status === SessionStatus.ACCEPTED || status === SessionStatus.REJECTED) {
            if (requestData.recipientId !== userId) {
                throw new Error('Only recipient can accept or reject requests');
            }
        } else if (status === SessionStatus.CANCELLED) {
            if (requestData.requesterId !== userId && requestData.recipientId !== userId) {
                throw new Error('Only requester or recipient can cancel');
            }
        }

        const updateData: Partial<SessionRequest> = {
            status,
            updatedAt: FieldValue.serverTimestamp() as any,
        };

        if (status === SessionStatus.ACCEPTED) {
            updateData.acceptedAt = FieldValue.serverTimestamp() as any;
        }

        await db.collection('sessionRequests').doc(requestId).update(updateData);

        // If accepted, create session schedules for both users
        if (status === SessionStatus.ACCEPTED) {
            await this.createSessionSchedules(requestId, requestData);
        }
    }

    /**
     * Create session schedules when a request is accepted
     */
    private static async createSessionSchedules(requestId: string, request: SessionRequest): Promise<void> {
        const schedule1 = {
            sessionRequestId: requestId,
            userId: request.requesterId,
            skillId: request.skillSoughtId,
            skillName: request.skillSoughtName,
            scheduledDate: request.proposedDate,
            scheduledTime: request.proposedTime,
            duration: request.duration,
            location: request.location,
            meetingLink: request.meetingLink,
            notes: request.description,
            status: SessionStatus.ACCEPTED,
            createdAt: FieldValue.serverTimestamp() as any,
            updatedAt: FieldValue.serverTimestamp() as any,
        };

        const schedule2 = {
            sessionRequestId: requestId,
            userId: request.recipientId,
            skillId: request.skillOfferedId,
            skillName: request.skillOfferedName,
            scheduledDate: request.proposedDate,
            scheduledTime: request.proposedTime,
            duration: request.duration,
            location: request.location,
            meetingLink: request.meetingLink,
            notes: request.description,
            status: SessionStatus.ACCEPTED,
            createdAt: FieldValue.serverTimestamp() as any,
            updatedAt: FieldValue.serverTimestamp() as any,
        };

        await Promise.all([
            db.collection('sessionSchedules').add(schedule1),
            db.collection('sessionSchedules').add(schedule2)
        ]);
    }

    /**
     * Cancel/Delete a session schedule
     */
    static async cancelSessionSchedule(scheduleId: string, userId: string): Promise<void> {
        const scheduleDoc = await db.collection('sessionSchedules').doc(scheduleId).get();
        if (!scheduleDoc.exists) {
            throw new Error('Session schedule not found');
        }

        const scheduleData = scheduleDoc.data();
        
        // Only the user who owns the schedule can cancel it
        if (scheduleData?.userId !== userId) {
            throw new Error('You can only cancel your own sessions');
        }

        // Update the schedule status to cancelled
        await db.collection('sessionSchedules').doc(scheduleId).update({
            status: SessionStatus.CANCELLED,
            updatedAt: FieldValue.serverTimestamp(),
        });

        // Also cancel the related session request if it's still pending or accepted
        if (scheduleData?.sessionRequestId) {
            const requestDoc = await db.collection('sessionRequests').doc(scheduleData.sessionRequestId).get();
            if (requestDoc.exists) {
                const requestData = requestDoc.data();
                // Only cancel the request if it hasn't been completed
                if (requestData?.status !== SessionStatus.COMPLETED && requestData?.status !== SessionStatus.CANCELLED) {
                    await db.collection('sessionRequests').doc(scheduleData.sessionRequestId).update({
                        status: SessionStatus.CANCELLED,
                        updatedAt: FieldValue.serverTimestamp(),
                    });
                }
            }
        }
    }

    /**
     * Get user's session schedules
     */
    static async getUserSessionSchedules(userId: string): Promise<any[]> {
        const schedules = await db.collection('sessionSchedules')
            .where('userId', '==', userId)
            .orderBy('scheduledDate', 'asc')
            .get();

        return schedules.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * Complete a session
     */
    static async completeSession(scheduleId: string, userId: string): Promise<void> {
        const scheduleDoc = await db.collection('sessionSchedules').doc(scheduleId).get();
        if (!scheduleDoc.exists) {
            throw new Error('Session schedule not found');
        }

        const scheduleData = scheduleDoc.data();
        if (scheduleData?.userId !== userId) {
            throw new Error('Only the session owner can complete the session');
        }

        await db.collection('sessionSchedules').doc(scheduleId).update({
            status: SessionStatus.COMPLETED,
            completedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        // Update the session request status if both schedules are completed
        if (scheduleData?.sessionRequestId) {
            const relatedSchedule = await db.collection('sessionSchedules')
                .where('sessionRequestId', '==', scheduleData.sessionRequestId)
                .where('status', '!=', SessionStatus.COMPLETED)
                .get();

            if (relatedSchedule.empty) {
                await db.collection('sessionRequests').doc(scheduleData.sessionRequestId).update({
                    status: SessionStatus.COMPLETED,
                    completedAt: FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp(),
                });
            }
        }
    }
}