import express from 'express'
import config from './config/config'
import { pub, sub } from './redis'
import { router } from './api/routes'

async function serve() { 
    await pub.connect() 
    await sub.connect() 
    const app = express() 
    
    app.use('/api', router)
    
    app.listen(config.port, () => { 
        console.log(`Server started at port: ${config.port}`)
    })
}

try { 
    serve() 
} catch(e) { 
    console.error(e) 
}