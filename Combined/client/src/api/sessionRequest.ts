import { httpsCallable } from "firebase/functions";
import { functions } from "./config";
import { SessionRequest, SessionStatus, SessionType } from "@/types/session";

export interface CreateSessionRequestParams {
    recipientId: string;
    skillOfferedId: string;
    skillOfferedName: string;
    skillSoughtId: string;
    skillSoughtName: string;
    sessionType: SessionType;
    proposedDate: Date;
    proposedTime: string;
    duration: number;
    location?: string;
    meetingLink?: string;
    description?: string;
}

export async function createSessionRequest(params: CreateSessionRequestParams) {
    try {
        const callable = httpsCallable(functions, "createSessionRequest");
        const result = await callable(params);
        return {
            error: false,
            data: result.data,
        };
    } catch (error: any) {
        return {
            error: true,
            msg: error.message || "Failed to create session request",
        };
    }
}

export async function getUserSessionRequests() {
    try {
        const callable = httpsCallable(functions, "getUserSessionRequests");
        const result = await callable({});
        return {
            error: false,
            data: result.data as SessionRequest[],
        };
    } catch (error: any) {
        return {
            error: true,
            msg: error.message || "Failed to get session requests",
            data: [] as SessionRequest[],
        };
    }
}

export async function getSessionRequestsByStatus(status: SessionStatus) {
    try {
        const callable = httpsCallable(functions, "getSessionRequestsByStatus");
        const result = await callable({ status });
        return {
            error: false,
            data: result.data as SessionRequest[],
        };
    } catch (error: any) {
        return {
            error: true,
            msg: error.message || "Failed to get session requests",
            data: [] as SessionRequest[],
        };
    }
}

export async function updateSessionRequestStatus(requestId: string, status: SessionStatus) {
    try {
        const callable = httpsCallable(functions, "updateSessionRequestStatus");
        const result = await callable({ requestId, status });
        return {
            error: false,
            data: result.data,
        };
    } catch (error: any) {
        return {
            error: true,
            msg: error.message || "Failed to update session request status",
        };
    }
}

export async function getUserSessionSchedules() {
    try {
        const callable = httpsCallable(functions, "getUserSessionSchedules");
        const result = await callable({});
        return {
            error: false,
            data: result.data,
        };
    } catch (error: any) {
        return {
            error: true,
            msg: error.message || "Failed to get session schedules",
            data: [],
        };
    }
}

export async function completeSession(scheduleId: string) {
    try {
        const callable = httpsCallable(functions, "completeSession");
        const result = await callable({ scheduleId });
        return {
            error: false,
            data: result.data,
        };
    } catch (error: any) {
        return {
            error: true,
            msg: error.message || "Failed to complete session",
        };
    }
}

export async function cancelSessionSchedule(scheduleId: string) {
    try {
        const callable = httpsCallable(functions, "cancelSessionSchedule");
        const result = await callable({ scheduleId });
        return {
            error: false,
            data: result.data,
        };
    } catch (error: any) {
        return {
            error: true,
            msg: error.message || "Failed to cancel session",
        };
    }
}