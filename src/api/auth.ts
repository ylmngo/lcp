import express from 'express'
import authService from '../service/auth'
import { AuthRequest, verifyCredentials } from './middlewares'

const router = express.Router() 

router.use(express.json())

router.use(verifyCredentials) 

/**
 * the user sends user credentials (username, email, password) 
 * Calculate the hash of the password using argon2  
 * store the username, password hash into a users table 
 * return the userId, email and the time at which user was created at as response 
 */
router.post('/register', async (req, res) => { 
    // TODO: Add a middleware the extracts the credentails validation
    const userReq = req as AuthRequest
    
    try { 
        const response = await authService.register(userReq.username, userReq.password, userReq.email) 
        return res.status(200).json(response)
    } catch (e) { 
        // TODO: Add a new error type 
        console.log(e)
        return res.status(400).json({
            message: "unable to register user"
        })
    }

})

/**
 * the user sends user credentials (email, password)
 * find the user by email 
 * verify the password given by the user and the one in the database matches 
 * return the userId, email as response 
 */
router.post('/login', async (req, res) => { 
    const userReq = req as AuthRequest
    
    try { 
        const response = await authService.login(userReq.email, userReq.password)
        return res.status(200).json(response) 
    } catch (e) { 
        // TODO: Add a new error type 
        console.log(e) 
        return res.status(400).json({
            message: "unable to login user",  
        })
    }
})

export default router 