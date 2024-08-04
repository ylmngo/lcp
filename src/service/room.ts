import crypto from 'node:crypto'
import argon2 from 'argon2'
import db from '../db'
import { omit } from 'lodash'
import { rooms } from '../schemas'
import { pub, sub } from '../redis'
import { UserModel, Room, RoomModel } from "../models";
import { eq, sql } from 'drizzle-orm';
import { PgArray } from 'drizzle-orm/pg-core'

async function createRoom(user: UserModel, key: string | undefined) {
    const roomUUID = crypto.randomUUID() 
    let keyHash: string = "" 
    try { 
        if (key !== undefined) { 
            keyHash = await argon2.hash(key) 
        }

        const r: Room = { 
            id: roomUUID, 
            email: user.email, 
            members: [user.email,], 
            userId: user.id, 
            key: keyHash, 
        }

        const resp = await db.insert(rooms).values(r).returning({id: rooms.id, userId: rooms.userId, email: rooms.email, members: rooms.members, createdAt: rooms.createdAt})
        if (resp.length === 0) { 
            throw new Error("unable to return values after insertion")
        }

        return resp[0]
    } catch (e) { 
        throw e 
    }
}

// TODO: Add message parsing after copy endpoint is implemented
async function joinRoom(roomId: string, u: UserModel, key: string | undefined) { 
    // get the key and members of the room with requested Room id 
    const resp = await db.select({key: rooms.key, members: rooms.members}).from(rooms).where(eq(rooms.id, roomId))
    if (resp.length === 0) { 
        throw new Error(`no room exists with id: ${rooms.id}`)
    }

    if (key === undefined) { 
        key = ""
    }
    
    const keyHash: string | null = resp[0].key
    
    try { 
        // verify whether the room id is valid 
        if (keyHash !== null || keyHash !== "") {
            const valid = await argon2.verify(keyHash!, key)
            if (!valid) {
                throw new Error("invalid room key")
            } 
        }

        // create a callback that will recieve messages when a message is published to a channel with the name room id 
        sub.subscribe(roomId, async (msg) => { 
            // message will be a json object serialized to a string literal 
            // deserialize the message to get the json object 
            // (the type of deserialized json object can be explicitly created in models.ts as MessageModel) 
            // the (MessageModel)? JSON Object will have attributes (MsgId, UserId, RoomId, Content, CreatedAt, Recipients)
            console.log("After copy", msg) 
            await pub.lPush(u.id.toString(), msg) 
        }).catch((e) => {
            console.error(e)
            console.log(`Error reading msg for subscriber: ${u.id} in room: ${roomId}`)
        })

        // append the user Id to members of the room 
        resp[0].members.push(u.email)
        
        // update the room to include the new member 
        const room = await db.update(rooms).set({ members: resp[0].members}).returning({id: rooms.id, email: rooms.email, userId: rooms.userId, members: rooms.members, createdAt: rooms.createdAt})

        return room[0]
    } catch (e) { 
        throw e 
    }
}

export default { 
    createRoom, 
    joinRoom, 
}