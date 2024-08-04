import request from 'supertest'
import app from './app'
import room from '../src/api/room'
import jwt from 'jsonwebtoken'
import config from '../src/config'
import db, { client } from '../src/db'
import { rooms } from '../src/schemas'
import { eq } from 'drizzle-orm'

describe('testing /room endpoints', () => { 
    const roomUrl = "/v1/room"
    let response: request.Response
    const jwtPayload = { 
        _id: 27, 
        _email: "admin_email@gmail.com", 
    }

    const joinerJwtPayload = { 
        _id: 39, 
        _email: "admin_email_2@gmail.com"
    }

    const token = jwt.sign(jwtPayload, config.jwtSecret)
    const joinerToken = jwt.sign(joinerJwtPayload, config.jwtSecret)
    
    beforeAll(() => { 
        app.use(roomUrl, room)
    })
    
    test('testing /create endpoint', async () => { 
        try { 
            response = await request(app).post(roomUrl + '/create').set("Authorization", "Bearer " + token).send({
                key: "room_key"
            })
            expect(response.statusCode).toBe(200)

            const resp = JSON.parse(response.text)

            expect(resp.userId).toBe(jwtPayload._id)
            expect(resp.email).toBe(jwtPayload._email) 
            expect(resp.members.length).toBe(1) 
            expect(resp.members[0]).toBe(jwtPayload._id)
        } catch (e) { 
            console.log(e) 
        }
    })

    test('testing /join endpoint', async () => { 
        try { 
            const resp = JSON.parse(response.text) 
            
            response = await request(app).post(roomUrl + '/join').set("Authorization", "Bearer " + joinerToken).send({
                roomId: resp.id,  
                key: "room_key"
            })

            const jsonResponse = JSON.parse(response.text) 
            
            expect(response.statusCode).toBe(200) 
            expect(jsonResponse.members.length).toBe(resp.members.length + 1) 
        } catch (e) { 
            console.error(e) 
        }
    })
    
    afterAll(async () => { 
        const jsonResponse = JSON.parse(response.text) 
        await db.delete(rooms).where(eq(rooms.id, jsonResponse.id))
    })
})