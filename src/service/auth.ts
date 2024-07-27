import crypto from 'node:crypto'
import * as argon2 from 'argon2'

// TODO: should return user schema from drizzle 
// TODO: Insert username, password, hash to users table returning user id 
async function register(username: string, password: string) { 
    if (username === "" || password === "") { 
        throw new Error("invalid user credentials: no username or password provided")
    }

    const salt = crypto.randomBytes(32)
    let passwordHash 

    try { 
        passwordHash = await argon2.hash(password, { salt: salt})
       
        
        return { 
            id: 1, 
            username: username,
            password: passwordHash,
        }
    } catch (e: any) { 
        throw new Error(e) 
    }
}

export default { 
    register
}