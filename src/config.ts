import dotenv from 'dotenv'

const found = dotenv.config() 
if (found.error) { 
    console.error("Unable to load .env file") 
    process.abort()
}

export default { 
    host: process.env.HOST ?? "localhost", 
    port: process.env.PORT ?? "3000", 
    dbName: process.env.DB_NAME ?? "postgres", 
    dbPassword: process.env.DB_PASSWORD ?? "", 
    dbHost: process.env.DB_HOST ?? "localhost", 
    dbPort: process.env.DB_PORT ?? "5432", 
    dbUser: process.env.DB_USER ?? "postgres", 
    jwtSecret: process.env.JWT_SECRET ?? "", 
    redisUrl: process.env.REDIS_URL === undefined ? 'redis://localhost:6379' : process.env.REDIS_URL!, 
}