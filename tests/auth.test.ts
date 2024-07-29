import request from 'supertest'
import app from './app'
import auth from '../src/api/auth'
import db from '../src/db'
import jwt, {JwtPayload} from 'jsonwebtoken'
import { users } from '../src/schemas'
import { eq } from 'drizzle-orm'
import { after } from 'node:test'
import config from '../src/config'


describe('Testing /v1/auth endpoint', () => { 
    const authUrl = '/v1/auth'
    let response: request.Response 

    beforeAll(() => { 
        app.use(authUrl, auth)
    })
    
    test('testing /register endpoint to register a new user', async () => { 
        try { 
            response = await request(app).post(authUrl + '/register').send({
                username: "test_username", 
                password: "test_password", 
                email: "test_email@gmail.com"
            })
            
            expect(response.statusCode).toBe(200)
            
            console.log(response.text)

        } catch (e) { 
            console.log(e) 
        }
    })

    test('testing /login endpoint', async () => { 
        try { 
            response = await request(app).post(authUrl + '/login').send({
                email: "test_email@gmail.com", 
                password: "test_password" 
            }) 

            expect(response.statusCode).toBe(200) 

            const resp = JSON.parse(response.text)  
            const payload = jwt.verify(resp.token, config.jwtSecret) as JwtPayload

            expect(payload._id).toBe(resp.id)
            expect(payload.exp).toBeLessThanOrEqual(Date.now())
            expect(payload._email).toBe("test_email@gmail.com")

            console.log(payload)  
        } catch (e) { 
            console.log(e) 
        }
    })

    afterAll(async () => { 
        const jsonResponse = JSON.parse(response.text)
        await db.delete(users).where(eq(users.id, jsonResponse.id))
    })
})