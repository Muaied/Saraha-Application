import geoip from 'geoip-lite'
import { client } from "../../DB/redis.connection.js";
import { rateLimit, ipKeyGenerator } from "express-rate-limit"
import { successResponse } from './response.utils.js';



async function fromWhere(ip) {
    try {
        return geoip.lookup(ip)
    } catch (error) {
        console.log(`fail to detect request origin`)
        console.log(error);

    }
}

export const generateRateLimiter = ({
    ttl = 5,
    limit = 50,
    legacyHeaders = true,
    standardHeaders = "draft-8",
    message = "Too many requests, try again later",
    statusCode = 429,
    skipSuccessfulRequests = true

} = {}) => {
    const limiter = rateLimit({
        windowMs: ttl * 60 * 1000,
        skipSuccessfulRequests,
        limit: async function (req) {
            const country = await fromWhere(req.ip)
            return country?.country === 'EG' ? limit : 0
        },
        handler: function (req, res, next) {
            return successResponse({ res, status: statusCode, message })
        },
        standardHeaders,
        legacyHeaders,
        keyGenerator: function (req) {
            const ip = ipKeyGenerator(req.ip, 52)
            return `${ip}::${req.path}`

        },
        store: {
            async incr(key, cb) {
                try {
                    const count = await client.incr(key)
                    if (count === 1) {
                        await client.expire(key, ttl * 60)
                    }
                    cb(null, count)
                } catch (error) {
                    cb(error)
                }
            },
            async decrement(key) {
                if (await client.exists(key)) {
                    await client.decr(key)
                }
            }

        }
    })

    return limiter;
}
