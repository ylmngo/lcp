import express from 'express'
import config from './config'
import auth from './api/auth'
import { pub, sub } from './redis'
import { router } from './api/routes'

// async function serve() { 
//     await pub.connect() 
//     await sub.connect() 
//     const app = express() 
    
//     app.use('/api', router)
    
//     app.listen(config.port, () => { 
//     })
// }

// try { 
//     serve() 
// } catch(e) { 
//     console.error(e) 
// }

async function run() { 
    const app = express() 
    app.use('/v1/auth', auth)
    
    try {
        app.listen(parseInt(config.port), config.host, () => { 
            console.log(`Server started at port: ${config.port}`)
        })

    } catch (e) { 
        console.error(e) 
    }
}