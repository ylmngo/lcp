import { integer, PgArray, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable('users', { 
    id: serial('id').primaryKey(), 
    username: text('name').notNull(), 
    password: text('password').notNull(), 
    email: text('email').notNull().unique(), 
    createdAt: timestamp('created_at').defaultNow(), 
})

export const rooms = pgTable('rooms', {
    id: uuid('id').primaryKey(), 
    key: text('key').default(""), 
    email: text('email').notNull(), 
    userId: integer('user_id').references(() => users.id), 
    members: text('members').array().notNull(), 
    createdAt: timestamp('created_at').defaultNow(),
})
