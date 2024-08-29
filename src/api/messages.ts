import express from 'express'
import { authenticateJWT, MessageRequest, verifyRoom } from './middlewares'
import { UserModel } from '../models'
import { pub } from '../redis'
import room from '../service/room'
import messageService from '../service/messages'
import { convertToObject } from 'typescript'

const router = express.Router() 

router.use(express.json())
router.use(authenticateJWT)

router.use('/copy', verifyRoom) 
router.post('/copy', async (req, res) => { 
    try { 
        const msg = await messageService.copyMessage(req as MessageRequest)
        return res.status(200).send(msg) 
    } catch (e: any) { 
        console.log(e) 
        return res.status(400).json({
            message: "unable to publish message to channel", 
            error: e, 
        })
    }
})

router.get('/paste', async (req, res) => { 
    try { 
        const msg = await messageService.pasteMessage(req as MessageRequest) 
        return res.status(200).send(msg) 
    } catch (e) { 
        return res.status(400).json({
            message: "unable to paste messages from channel", 
            error: e, 
        })
    }
})

export default router 