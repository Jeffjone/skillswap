import { db } from '../lib/firebase';
import { UserRole } from '../types/user';

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: 'general' | 'account' | 'team' | 'challenges' | 'content';
    role: UserRole;
    order: number;
    isActive: boolean;
}

export class FAQService {
    private static readonly FAQ_COLLECTION = 'faqs';

    /**
     * Get all FAQs for a role
     */
    static async getFAQs(role: UserRole): Promise<FAQ[]> {
        const faqs = await db.collection(this.FAQ_COLLECTION)
            .where('role', '==', role)
            .where('isActive', '==', true)
            .orderBy('order', 'asc')
            .get();

        return faqs.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as FAQ[];
    }

    /**
     * Get FAQs by category
     */
    static async getFAQsByCategory(role: UserRole, category: FAQ['category']): Promise<FAQ[]> {
        const faqs = await db.collection(this.FAQ_COLLECTION)
            .where('role', '==', role)
            .where('category', '==', category)
            .where('isActive', '==', true)
            .orderBy('order', 'asc')
            .get();

        return faqs.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as FAQ[];
    }

    /**
     * Search FAQs
     */
    static async searchFAQs(role: UserRole, query: string): Promise<FAQ[]> {
        const faqs = await db.collection(this.FAQ_COLLECTION)
            .where('role', '==', role)
            .where('isActive', '==', true)
            .get();

        const results = faqs.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as FAQ[];

        return results.filter(faq => 
            faq.question.toLowerCase().includes(query.toLowerCase()) ||
            faq.answer.toLowerCase().includes(query.toLowerCase())
        );
    }

    /**
     * Get FAQ categories
     */
    static async getCategories(role: UserRole): Promise<string[]> {
        const faqs = await db.collection(this.FAQ_COLLECTION)
            .where('role', '==', role)
            .where('isActive', '==', true)
            .get();

        const categories = new Set<string>();
        faqs.docs.forEach(doc => {
            const data = doc.data() as FAQ;
            categories.add(data.category);
        });

        return Array.from(categories);
    }
} 