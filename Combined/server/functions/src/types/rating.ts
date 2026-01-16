export interface Rating {
    id: string;
    sessionRequestId: string;
    sessionScheduleId?: string;
    raterId: string;
    raterName: string;
    rateeId: string;
    rateeName: string;
    skillId: string;
    skillName: string;
    rating: number; // 1-5 stars
    feedback?: string;
    createdAt: Date;
}

export interface UserRating {
    userId: string;
    averageRating: number;
    totalRatings: number;
}
