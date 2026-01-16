import { httpsCallable } from "firebase/functions";
import { functions } from "./config";
import { Rating } from "@/types/rating";

export interface CreateRatingParams {
    sessionRequestId: string;
    sessionScheduleId?: string;
    rateeId: string;
    rateeName: string;
    skillId: string;
    skillName: string;
    rating: number;
    feedback?: string;
}

export async function createRating(params: CreateRatingParams, currentUserId: string, currentUserName: string) {
    try {
        const callable = httpsCallable(functions, "createRating");
        const result = await callable({
            ...params,
            raterId: currentUserId,
            raterName: currentUserName
        });
        return {
            error: false,
            data: result.data,
        };
    } catch (error: any) {
        return {
            error: true,
            msg: error.message || "Failed to create rating",
        };
    }
}

export async function getUserRatings(userId: string) {
    try {
        const callable = httpsCallable(functions, "getUserRatings");
        const result = await callable({ userId });
        return {
            error: false,
            data: (result.data as any).ratings as Rating[],
        };
    } catch (error: any) {
        return {
            error: true,
            msg: error.message || "Failed to get user ratings",
        };
    }
}

export async function getUserRatingSummary(userId: string) {
    try {
        const callable = httpsCallable(functions, "getUserRatingSummary");
        const result = await callable({ userId });
        return {
            error: false,
            data: result.data as { averageRating: number; totalRatings: number },
        };
    } catch (error: any) {
        return {
            error: true,
            msg: error.message || "Failed to get rating summary",
        };
    }
}

export async function hasUserRatedSession(userId: string, sessionRequestId: string): Promise<boolean> {
    try {
        // For now, we'll check on the backend when creating the rating
        // This is a placeholder that could be expanded
        return false;
    } catch (error) {
        return false;
    }
}
