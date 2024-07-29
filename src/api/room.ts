import express from 'express'
import crypto from 'node:crypto'
import db from '../db'
import argon2 from 'argon2'
import roomService from '../service/room'
import { authenticateJWT, RoomRequest } from './middlewares'
import { rooms } from '../schemas'
import { Room, RoomModel, UserModel } from '../models'
import { eq } from 'drizzle-orm'

const router = express.Router() 

router.use(express.json())
router.use(authenticateJWT) 

// change it to join the owner by default 
router.post('/create', async (req, res) => { 
    const u: UserModel = (req as RoomRequest).user 
    let key: string | undefined = req.body.key 

    try { 
        const r = await roomService.createRoom(u, key)
        return res.status(200).json(r) 
    } catch (e) { 
        console.error(e) 
        return res.status(400).json({
            message: "unable to create room", 
            error: e
        })
    }
    
})

router.post('/join', async (req, res) => { 
    const u: UserModel = (req as RoomRequest).user  
    let key: string | undefined = req.body.key 
    let roomId: string | undefined = req.body.roomId

    if (roomId === undefined) { 
        return res.status(404).json({
            message: "invalid room id"
        })
    }

    try { 
        const room: RoomModel = await roomService.joinRoom(roomId, u, key) 
        return res.status(200).json(room) 
    } catch (e) { 
        console.error(e) 
        return res.status(400).json({
            message: "unable to join room", 
            error: e 
        })
    }
})

export default router 
