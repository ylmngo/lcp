import request from 'supertest'
import app from './app'
import auth from '../src/api/auth'
import db from '../src/db'
import { users } from '../src/schemas'
import { eq } from 'drizzle-orm'


describe('Testing /v1/auth endpoint', () => { 
    const authUrl = '/v1/auth'
    app.use(authUrl, auth)
    
    test('testing /register endpoint to register a new user', async () => { 
        try { 
            const response = await request(app).post(authUrl + '/register').send({
                username: "test_username", 
                password: "test_password", 
                email: "test_email@gmail.com"
            })
            
            expect(response.statusCode).toBe(200)
            
            console.log(response.text)

            const jsonResponse = JSON.parse(response.text)[0]

            await db.delete(users).where(eq(users.id, jsonResponse.id))
        } catch (e) { 
            fail(e)
        }
    })
})