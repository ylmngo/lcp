import { drizzle } from "drizzle-orm/node-postgres"
import { Client, Pool } from "pg"
import config from './config'

function openDB(cfg: any) { 
    const client = new Client({
        user: cfg.dbUser, 
        port: parseInt(cfg.dbPort), 
        host: cfg.dbHost, 
        password: cfg.dbPassword, 
        database: cfg.dbName, 
    })
    client.connect((e: any) => { 
        if (e) { 
            console.error(e) 
            process.abort()
        }
        console.log("Database connection established")
    })
    return client
} 

const client = openDB(config)

export default drizzle(client) 