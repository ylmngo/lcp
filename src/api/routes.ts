import express from 'express'
import crypto from 'node:crypto'
import { pub, sub } from '../redis'

export const router = express.Router() 

const ROOM_SET = 'rooms'
const USER_SET = 'users'

router.use(express.json())

// craete a new room and add it to the redis set 
// improve response json 
router.post('/create', async (req, res) => { 
    const roomId = crypto.randomUUID() 
    try { 
        const reply = await pub.SADD(ROOM_SET, roomId) 
        if (reply === 0) { 
            return res.status(500).json({
                error: true, 
                response: "Invalid room id, already present in set"
            })
        }
    } catch (e) { 
        console.error(e) 
        return res.status(500).json({
            error: true, 
            response: "unable to add room id to redis set"
        })
    }
    
    return res.status(200).json({
        error: false, 
        response: roomId
    })
})

// connect to a room with room id 
// if the room id is not in ROOM_SET, errors out 
// creates a new user id and adds it to the USER_SET 
// creates a callback to be called when a message is sent from the publisher 
// message is sent to the user with userId  
router.post('/connect/:roomId', async (req, res) => { 
    const roomId = req.params.roomId 
    if (roomId === "") { 
        return res.status(400).json({
            error: true, 
            response: "invalid room id"
        })
    }
    
    try { 
        const validRoom = await pub.SISMEMBER(ROOM_SET, roomId) 
        if (!validRoom) { 
            return res.status(400).json({
                error: true,  
                response: "invalid room id, create one by hitting the /create endpoint"
            })
        }
    } catch(e) { 
        console.error(e) 
        return res.status(500).json({
            error: true, 
            response: "unable to verify valid room id"
        })
    }
    
    const userId = crypto.randomUUID()
    try { 
        const reply = await pub.SADD(USER_SET, userId) 
        if (reply === 0) { 
            return res.status(500).json({
                error: true, 
                response: "invalid user id, already present in set"
            })
        }
    } catch(e) { 
        console.error(e) 
        return res.status(500).json({
            error: true, 
            response: "unable to add user id to redis set"
        })
    }

    try { 
        await sub.subscribe(roomId, async (msg) => { 
            console.log("After copy", msg)
            await pub.lPush(userId, msg)
        })
    } catch(e) { 
        console.error(e) 
        return res.status(500).json({
            error: true, 
            response: "unable to connect to room"
        })
    }

    return res.status(200).json({
        error: false, 
        userId: userId, 
        response: "connected to room"
    })
})

// verify room id is present in room set, else return 
// get the content and format of the data to be published 
// publish the JSON stringified message to pub  
router.post('/copy/:roomId', async (req, res) => { 
    const roomId = req.params.roomId 
    try { 
        const validRoom = await pub.SISMEMBER(ROOM_SET, roomId) 
        if (!validRoom) {  
            return res.status(400).json({
                error: true, 
                response: "invalid room id, not present in room set"
            })
        }
    } catch (e) { 
        console.error(e) 
        return res.status(500).json({
            error: true, 
            response: "unable to verify valid room id"
        })
    }
    
    const content: string | undefined = req.body?.message
    let format: string  | undefined = req.body?.format 
    
    if (format === undefined)   format = 'txt'
    if (content === undefined) { 
        return res.status(400).json({
            error: true, 
            response: "Invalid message"
        })
    }

    try { 
        const publishMsg = JSON.stringify({ 
            content: content, 
            format: format 
        })
        await pub.publish(roomId, publishMsg)
    } catch (e) { 
        console.error(e) 
        return res.status(500).json({
            error: true, 
            response: "Internal server error"
        })
    }

    return res.status(200).json({
        error: false, 
        response: "succesfully copied message"
    })
})

// TODO: handle parsing the content as per the format of the content 
router.get('/paste/:userId', async (req, res) => { 
    const userId = req.params.userId
    try { 
        const validUser = await pub.SISMEMBER(USER_SET, userId) 
        if (!validUser) { 
            return res.status(400).json({
                error: true, 
                response: "invalid user id, not present in user set"
            })
        }
    } catch (e) { 
        console.error(e) 
        return res.status(500).json({
            error: true, 
            response: "unable to verify valid user id"
        })
    }
    
    try { 
        let data = await pub.lPop(userId)
        if (data === null) { 
            data = "" 
        }
        const decMsg = JSON.parse(data)
        
        console.log("From paste: ", decMsg.content)
        return res.status(200).json({
            error: false, 
            response: decMsg.content
        })

    } catch(e) { 
        console.error(e) 
        return res.status(500).json({
            error: true, 
            response: "unable to get data from publisher"
        })
    }

}) 