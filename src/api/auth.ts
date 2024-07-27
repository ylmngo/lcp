import express from 'express'
import authService from '../service/auth'

const router = express.Router() 

router.use(express.json())

/**
 * TODO: insert user to users table
 */
router.post('/register', async (req, res) => { 
    /**
     * the user sends user credentials (username, password) 
     * Calculate the hash of the password (argon2 + salt of random bytes 32) 
     * store the username, password hash, salt into a users table 
     * return the username, userId and the message succesfully registered
     */

    let credentials = req.body 
    if (credentials === undefined || credentials === null) { 
        return res.status(400).json({
            message: "invalid user credentials."
        })
    }

    try { 
        const data = await authService.register(credentials.username, credentials.password) 
        return res.status(200).json(data)
    } catch (e) { 
        console.log(e)
        return res.status(500).json({
            message: "unable to register user"
        })
    }

})

export default router 