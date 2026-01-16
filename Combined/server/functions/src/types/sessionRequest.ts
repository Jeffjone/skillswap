export enum SessionStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export enum SessionType {
    SKILL_EXCHANGE = 'skill_exchange',
    TUTORING = 'tutoring',
    MENTORING = 'mentoring',
    COLLABORATION = 'collaboration'
}

export interface SessionRequest {
    id: string;
    requesterId: string;
    requesterName: string;
    requesterEmail: string;
    recipientId: string;
    recipientName: string;
    recipientEmail: string;
    skillOfferedId: string;
    skillOfferedName: string;
    skillSoughtId: string;
    skillSoughtName: string;
    sessionType: SessionType;
    proposedDate: Date;
    proposedTime: string;
    duration: number; // in minutes
    location?: string;
    meetingLink?: string;
    description?: string;
    status: SessionStatus;
    createdAt: Date;
    updatedAt: Date;
    acceptedAt?: Date;
    completedAt?: Date;
}

export interface SessionSchedule {
    id: string;
    sessionRequestId: string;
    userId: string;
    skillId: string;
    skillName: string;
    scheduledDate: Date;
    scheduledTime: string;
    duration: number;
    location?: string;
    meetingLink?: string;
    notes?: string;
    status: SessionStatus;
    createdAt: Date;
    updatedAt: Date;
}