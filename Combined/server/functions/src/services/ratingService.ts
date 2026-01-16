import { firestore } from "firebase-admin";
import { Rating } from "../types/rating";

const db = firestore();

export class RatingService {
    /**
     * Create a rating for a completed session
     */
    static async createRating(rating: Omit<Rating, 'id' | 'createdAt'>): Promise<string> {
        const ratingData: Omit<Rating, 'id'> = {
            ...rating,
            createdAt: new Date(),
        };

        const docRef = await db.collection('ratings').add(ratingData);
        
        // Update user's average rating
        await this.updateUserRating(rating.rateeId);
        
        return docRef.id;
    }

    /**
     * Get ratings for a user
     */
    static async getUserRatings(userId: string): Promise<Rating[]> {
        const ratings = await db.collection('ratings')
            .where('rateeId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return ratings.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Rating));
    }

    /**
     * Get rating summary for a user (average and total)
     */
    static async getUserRatingSummary(userId: string): Promise<{ averageRating: number; totalRatings: number }> {
        const ratings = await db.collection('ratings')
            .where('rateeId', '==', userId)
            .get();

        if (ratings.empty) {
            return { averageRating: 0, totalRatings: 0 };
        }

        let total = 0;
        ratings.forEach(doc => {
            const data = doc.data();
            total += data.rating || 0;
        });

        const averageRating = total / ratings.size;
        
        return {
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            totalRatings: ratings.size
        };
    }

    /**
     * Update user's rating in their profile
     */
    private static async updateUserRating(userId: string): Promise<void> {
        const summary = await this.getUserRatingSummary(userId);
        
        await db.collection('users').doc(userId).update({
            averageRating: summary.averageRating,
            totalRatings: summary.totalRatings
        });
    }

    /**
     * Check if user has already rated a session
     */
    static async hasUserRatedSession(userId: string, sessionRequestId: string): Promise<boolean> {
        const existing = await db.collection('ratings')
            .where('raterId', '==', userId)
            .where('sessionRequestId', '==', sessionRequestId)
            .limit(1)
            .get();

        return !existing.empty;
    }

    /**
     * Get all ratings (for admin)
     */
    static async getAllRatings(limit: number = 50): Promise<Rating[]> {
        const ratings = await db.collection('ratings')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        return ratings.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Rating));
    }
}
