export type UserRole = 'member' | 'teamCaptain' | 'contentManager';

export interface User {
    id: string;
    email: string;
    displayName: string;
    role: UserRole;
    teamId?: string;
    createdAt: Date;
    lastLogin: Date;
    preferences: {
        notifications: boolean;
        theme: 'light' | 'dark';
        language: string;
    };
} 