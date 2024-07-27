import app from './app'
import auth from '../api/auth'
import request from 'supertest'


describe('Testing /register endpoint', () => { 
    const authUrl = '/v1/auth'
    app.use(authUrl, auth)
    test('registers user credentials to the database', async () => { 
        const response = await request(app).post(authUrl + '/register').send({
            username: "test_username", 
            password: "test_password"
        })
        expect(response.statusCode).toBe(200)
    })
})