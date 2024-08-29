import { Request } from 'express'
import { MessageRequest } from '../api/middlewares'
import { MessageModel, UserModel } from '../models'
import { pub } from '../redis'

async function copyMessage(req: MessageRequest) { 
    const user: UserModel = req.user 
    const roomId: string  = req.roomId 
    
    const content: string | undefined = req.body.content 
    if (content === undefined) { 
        throw new Error("message has no content")
    }

    const message: MessageModel = { 
        id: 1, 
        userId: user.id, 
        room: roomId, 
        content: content, 
        recipients: ["all", ]
    }

    const serializedMessage = JSON.stringify(message)
    await pub.publish(roomId, serializedMessage)

    return message
}

async function pasteMessage(req: MessageRequest) { 
    const user: UserModel = req.user 
    
    try {
        let msg = await pub.lPop(user.id.toString())  
        if (msg === null)   msg = "";   
        return msg 
    } catch (e) { 
        throw e
    }
}

export default { 
    copyMessage, 
    pasteMessage
}