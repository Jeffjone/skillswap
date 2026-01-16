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