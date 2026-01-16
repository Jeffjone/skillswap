import { httpsCallable } from "firebase/functions";
import { functions } from "./config";

export async function getPlatformStats() {
    try {
        const callable = httpsCallable(functions, "getPlatformStats");
        const result = await callable({});
        return {
            error: false,
            data: result.data as any,
        };
    } catch (error: any) {
        return {
            error: true,
            msg: error.message || "Failed to get platform stats",
        };
    }
}

export async function getAllUsers(limit?: number) {
    try {
        const callable = httpsCallable(functions, "getAllUsers");
        const result = await callable({ limit: limit || 100 });
        return {
            error: false,
            data: (result.data as any).users as any[],
        };
    } catch (error: any) {
        return {
            error: true,
            msg: error.message || "Failed to get users",
        };
    }
}

export async function getRecentActivity(limit?: number) {
    try {
        const callable = httpsCallable(functions, "getRecentActivity");
        const result = await callable({ limit: limit || 50 });
        return {
            error: false,
            data: (result.data as any).activity as any[],
        };
    } catch (error: any) {
        return {
            error: true,
            msg: error.message || "Failed to get recent activity",
        };
    }
}

export async function adminUpdateUser(userId: string, updates: any) {
    try {
        const callable = httpsCallable(functions, "adminUpdateUser");
        const result = await callable({ userId, updates });
        return {
            error: false,
            data: result.data,
        };
    } catch (error: any) {
        return {
            error: true,
            msg: error.message || "Failed to update user",
        };
    }
}

export async function adminDeleteUser(userId: string) {
    try {
        const callable = httpsCallable(functions, "adminDeleteUser");
        const result = await callable({ userId });
        return {
            error: false,
            data: result.data,
        };
    } catch (error: any) {
        return {
            error: true,
            msg: error.message || "Failed to delete user",
        };
    }
}
