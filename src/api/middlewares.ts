import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import config from '../config'
import db from '../db'
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
        const claims = jwt.verify(token, config.jwtSecret) as JwtPayload

        const user = await db.select({id: users.id, username: users.username, email: users.email}).from(users).where(and(eq(users.id, claims._id), eq(users.email, claims._email)));
        if (user.length === 0) { 
            throw new Error("invalid token: no user with such claims")
        }

        (req as RoomRequest).user = user[0];
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