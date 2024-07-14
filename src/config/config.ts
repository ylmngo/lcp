import dotenv from 'dotenv'

const found = dotenv.config() 
if (found.error) { 
    console.error("Unable to load .env file") 
    process.abort()
}

export default { 
    port: parseInt(process.env.PORT === undefined ? '3000' : process.env.PORT!), 
    redisUrl: process.env.REDIS_URL === undefined ? 'redis://localhost:6379' : process.env.REDIS_URL!, 
}