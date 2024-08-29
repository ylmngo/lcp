import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import config from '../config'
import db from '../db'
import argon2 from 'argon2'
import { RoomModel, User, UserModel } from '../models'
import { rooms, users } from '../schemas'
import { and, eq } from 'drizzle-orm'

export interface AuthRequest extends Request { 
    username: string
    password: string 
    email: string 
}

export interface RoomRequest extends Request { 
    user: UserModel
}

export interface MessageRequest extends Request { 
    user: UserModel 
    roomId: string 
    content: string 
}

export async function processTime(req: Request, res: Response, next: NextFunction) { 
    const start = Date.now() 

    res.on('finish', () => { 
        const duration = Date.now() - start 
        console.log(`${req.method} ${req.originalUrl} FINISHED in ${duration}ms`)
    })
    
    next() 
}

export function verifyCredentials(req: Request, res: Response, next: NextFunction) { 
    let credentials = req.body 
    if (!credentials) { 
        return res.status(400).json({
            message: "invalid user credentials"
        })
    }

    if (credentials.password === undefined || credentials.password === "") { 
        return res.status(400).json({
            message: "invalid user credentials: no password provided"
        })
    }

    if (credentials.email === undefined || credentials.passsword === "") { 
        return res.status(400).json({
            message: "invalid user credentials: no email provided"
        })
    }

    if (credentials.username === undefined || credentials.username === "") { 
        credentials.username = "" 
    }

    (req as AuthRequest).username = credentials.username;   
    (req as AuthRequest).password = credentials.password; 
    (req as AuthRequest).email = credentials.email; 

    
    next() 
}

export async function authenticateJWT(req: Request, res: Response, next: NextFunction) { 
    try { 
        const header = req.header('Authorization')
        if (header === undefined) { 
            return res.status(400).json({
                message: "no authorization header"
            })
        }

        const token = header.replace("Bearer ", "")
        const claims = jwt.verify(token, config.jwtSecret) as JwtPayload; 

        const user: UserModel = { 
            id: claims._id, 
            email: claims._email 
        }; 

        (req as RoomRequest).user = user;
    } catch (e) { 
        if (e instanceof jwt.TokenExpiredError) { 
            return res.status(403).json({
                message: "token has expired"
            })
        }
        console.log(e); 
        res.status(400).json({
            message: e 
        })
    }

    next() 
} 

export async function verifyRoom(req: Request, res: Response, next: NextFunction) { 
    const u: UserModel = (req as MessageRequest).user 
    const roomId: string | undefined = req.body.roomId 
    if (roomId === undefined) { 
        return res.status(403).json({
            message: "invalid room id"            
        })
    }

    try { 
        const resp = await db.select({members: rooms.members}).from(rooms).where(eq(rooms.id, roomId))
        if (resp.length === 0) { 
            throw new Error("no room with such room id exists")
        }

        const members: string[] = resp[0].members 
        console.log(members) 

        if (!members.includes(u.email)) { 
            throw new Error("user is not a member of this room")
        }
    } catch (e: any) { 
        return res.status(400).json({
            message: e.message,  
        })
    }

    (req as MessageRequest).roomId = roomId; 

    next() 
}
