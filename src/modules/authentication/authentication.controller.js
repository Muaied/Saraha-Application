import { Router } from 'express'
import { login, signup, confirmEmail, resendConfirmEmail, requestForgotPasswordCode, verifyForgotPasswordCode, resetForgotPassword } from './authentication.service.js';
import { successResponse } from '../../common/utils/response.utils.js';
import * as validators from './authentication.validation.js'
import { validation } from '../../middleware/validation.middleware.js';
import { del } from '../../common/services/cache.service.js';
import { generateRateLimiter } from '../../common/utils/limiter.js';


// async function fromWhere(ip) {
//         try {
//                 return geoip.lookup(ip)
//         } catch (error) {
//                 console.log(`fail to detect request origin`)
//                 console.log(error);

//         }
// }

// const loginLimiter = rateLimit({
//         windowMs: 1 * 60 * 1000, // 1 minutes
//         skipSuccessfulRequests: true,
//         limit: async function (req) {
//                 const country = await fromWhere(req.ip)
//                 console.log({ country, code: country.country })

//                 return country.country === 'EG' ? 5 : 0
//         },
//         message:
//                 'Too many requests from this IP, please try again after 1 minutes',
//         keyGenerator: function (req) {
//                 const ip = ipKeyGenerator(req.ip, 52)
//                 return `${ip}::${req.path}`

//         },
//         store: {
//                 async incr(key, cb) {
//                         try {
//                                 const count = await client.incr(key)
//                                 if (count === 1) {
//                                         await client.expire(key, 60)
//                                 }
//                                 cb(null, count)
//                         } catch (error) {
//                                 cb(error)
//                         }
//                 },

//                 async decrement(key) {
//                         if (await client.exists(key)) {
//                                 await client.decr(key)
//                         }
//                 }

//         }
// })





const router = Router({ caseSensitive: false, strict: false, mergeParams: true })

router.post('/signup', validation(validators.signup), async (req, res, next) => {
        const account = await signup(req.body);
        return successResponse({ res, status: 201, data: account })
})

router.post('/request-forgot-password-code', validation(validators.resendConfirmEmail), async (req, res, next) => {
        const account = await requestForgotPasswordCode(req.body);
        return successResponse({ res, status: 201, data: account })
})

router.post('/verify-forgot-password', validation(validators.confirmEmail), async (req, res, next) => {
        const account = await verifyForgotPasswordCode(req.body);
        return successResponse({ res, status: 200, data: account })
})
router.patch('/reset-forgot-password', validation(validators.resetForgotPassword), async (req, res, next) => {
        const account = await resetForgotPassword(req.body);
        return successResponse({ res, status: 200, data: account })
})
router.patch('/confirm-email', validation(validators.confirmEmail), async (req, res, next) => {
        const account = await confirmEmail(req.body);
        return successResponse({ res, status: 200, data: account })
})
router.patch('/resend-confirm-email', validation(validators.resendConfirmEmail), async (req, res, next) => {
        const account = await resendConfirmEmail(req.body);
        return successResponse({ res, status: 200, data: account })
})

const loginLimiter = generateRateLimiter({ limit: 5, ttl: 3, skipSuccessfulRequests: true })

router.post('/login', loginLimiter, validation(validators.login), async (req, res, next) => {

        const account = await login(req.validate.body, `${req.protocol}://${req.host}`);
        await del({ key: req.rateLimit.key })
        return successResponse({ res, data: account })
})

export default router;