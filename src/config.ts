import dotenv from 'dotenv'

const found = dotenv.config() 
if (found.error) { 
    console.error("Unable to load .env file") 
    process.abort()
}

export default { 
    host: process.env.HOST ?? "localhost", 
    port: process.env.PORT ?? "3000", 
    redisUrl: process.env.REDIS_URL === undefined ? 'redis://localhost:6379' : process.env.REDIS_URL!, 
}