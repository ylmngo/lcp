import { users } from './schemas'

export type User = typeof users.$inferInsert
export type UserModel = { 
    id: number, 
    email: string, 
    username: string, 
}