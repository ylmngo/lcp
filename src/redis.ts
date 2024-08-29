import * as redis from 'redis'
import config from './config'

export const pub = redis.createClient({url: config.redisUrl}).on('error', (e) => { console.error(e); process.abort() })
export const sub = redis.createClient({url: config.redisUrl}).on('error', (e) => { console.error(e); process.abort() })