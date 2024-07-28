import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import * as argon2 from 'argon2'
import db from '../db'
import { users } from '../schemas'
import { User } from '../models'
import { eq } from 'drizzle-orm'
import config from '../config'

async function register(username: string, password: string, email: string) { 
    if (username === "" || password === "" || email === "") { 
        throw new Error("invalid user credentials: no username or password provided")
    }

    let passwordHash: string  

    try { 
        passwordHash = await argon2.hash(password)

        const u: User = { 
            username: username, 
            password: passwordHash, 
            email: email
        }

        const response = await db.insert(users).values(u).returning({id: users.id, email: users.email, createdAt: users.createdAt})

        return response 
    } catch (e: any) { 
        throw new Error(e) 
    }
}

// should return a JWT Token if the user is validated
async function login(email: string, password: string) { 
    if (email === "" || password === "") { 
        throw new Error("invalid user credentials: no email or password provided")
    }

    try { 
        const queryResponse = await db.select({id: users.id, password: users.password}).from(users).where(eq(users.email, email))
        if (queryResponse.length === 0) { 
            throw new Error("invalid user credentials: user does exist with this email")
        }
        const passwordHash = queryResponse[0].password
        const userId = queryResponse[0].id
        const valid = await argon2.verify(passwordHash, password)
        if (!valid) { 
            throw new Error("invalid user credentials: password does not match")
        }

        const jwtPayload = { 
            _id: userId, 
            _email: email, 
        }
        
        const token = jwt.sign(jwtPayload, config.jwtSecret, { expiresIn: '1h'})

        return { 
            id: userId, 
            email: email, 
            token: token 
        }

    } catch(e) { 
        throw e 
    }
}

export default { 
    register, 
    login, 
}