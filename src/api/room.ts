import express from 'express'
import { authenticateJWT, RoomRequest } from './middlewares'

const router = express.Router() 

router.use(authenticateJWT) 

router.post('/create', (req, res) => { 
    const u = (req as RoomRequest).user
    console.log(u) 
    return res.status(200)
})

export default router 
