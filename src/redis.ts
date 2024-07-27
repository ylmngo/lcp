import * as redis from 'redis'
import config from './config'

export const pub = redis.createClient({url: config.redisUrl}).on('error', (e) => { console.error(e) })
export const sub = redis.createClient({url: config.redisUrl}).on('error', (e) => { console.error(e) })