import { rooms, users } from './schemas'

export type User = typeof users.$inferInsert
export type Room = typeof rooms.$inferInsert

export type UserModel = { 
    id: number, 
    email: string, 
}

export type RoomModel = { 
    id: string;
    createdAt: Date | null;
    members: string[];
    userId: number | null;
    email: string;
}

export type MessageModel = { 
    id: number; 
    room: string; 
    userId: number; 
    content: string; 
    recipients: string[]; 
}