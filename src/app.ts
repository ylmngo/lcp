import express from 'express'
import config from './config'
import auth from './api/auth'
import room from './api/room'
import messages from './api/messages'
import db from './db'
import { processTime } from './api/middlewares'
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { pub, sub } from "./redis"

async function run() { 
    const app = express() 
    app.use(processTime)
    app.use('/v1/auth', auth)
    app.use('/v1/room', room)
    app.use('/v1/messages', messages)

    try {
        await pub.connect()
        await sub.connect() 

        await migrate(db, { migrationsFolder: "./migrations"})
        
        app.listen(parseInt(config.port), config.host, () => { 
            console.log(`Server started at port: ${config.port}`)
        })

    } catch (e) { 
        console.error(e) 
    }
}

run() 