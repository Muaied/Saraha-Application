import { userModel } from "../../DB/model/index.js";
import { ConflictException, NotFoundException, TooManyRequestsException } from "../../common/exceptions/index.js";
import { findOne, createOne } from "../../common/repository/index.js"

import { compare, hash } from "../../common/security/hash.security.js";
import { encryption } from "../../common/security/encryption.security.js";
import { createLoginCredentials, userBaseRevokeTokenkey } from "../../common/security/token.security.js";
import { emailEvent, UserEmailKey, UserEmailTrailsKey, UserLoginAttemptsKey } from "../../common/utils/email/index.js";
import { EmailSubjectEnum, ProviderEnum } from "../../common/enum/index.js";
import { createOtp } from "../../common/utils/index.js";
import { set, get, del, incrBy, expire, ttl, keys } from "../../common/services/cache.service.js";


const sendEmailOtp = async ({ email, subject, expiresIn = 120, maxTrails = 3, blockInSeconds = 300, title }) => {
    const existOtp_TTL = await ttl({ key: UserEmailKey({ email, subject }) })
    if (existOtp_TTL > 0) throw ConflictException("sorry we can't send you another code please try again in " + existOtp_TTL + " seconds")
    const oldTrails = await get({ key: UserEmailTrailsKey({ email, subject }) }) ?? 0
    if (oldTrails >= maxTrails) throw TooManyRequestsException("max trails exceeded")
    const code = createOtp()
    await set({
        key: UserEmailKey({ email, subject }),
        value: await hash(code.toString()),
        ttl: expiresIn
    })
    const currentTrails = await incrBy({ key: UserEmailTrailsKey({ email, subject }) })
    if (currentTrails == maxTrails) {
        await expire({ key: UserEmailTrailsKey({ email, subject }), ttl: blockInSeconds })
    }
    emailEvent.emit("sendEmail", { recipients: { to: email }, subject, data: { code, title: title ?? subject } })
}

export const signup = async ({ email, password, username, phone }) => {
    const duplicateAccount = await findOne({ model: userModel, filter: { email }, options: { select: "email" } })
    if (duplicateAccount) throw ConflictException("email is already used")
    const account = await createOne({
        model: userModel,
        data: {
            email,
            password: await hash(password),
            username,
            phone: await encryption(phone)
        }
    })
    await sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL })
    return account

}


export const confirmEmail = async ({ otp, email }) => {
    const account = await findOne({ model: userModel, filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: false } } })
    if (!account) throw NotFoundException("invalid account")

    const hashOtp = await get({ key: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) })
    if (!hashOtp || !await compare(otp, hashOtp)) {
        throw ConflictException("invalid otp")
    }
    account.confirmEmail = new Date()
    await account.save()
    await del({ key: await keys({ prefix: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) }) })
    return
}


export const resendConfirmEmail = async ({ email }) => {
    const account = await findOne({ model: userModel, filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: false } } })
    if (!account) throw NotFoundException("invalid account")
    await sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL })
    return
}

export const requestForgotPasswordCode = async ({ email }) => {
    const account = await findOne({ model: userModel, filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } } })
    if (!account) throw NotFoundException("invalid account")
    await sendEmailOtp({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD })
    return
}



export const verifyForgotPasswordCode = async ({ otp, email }) => {
    const account = await findOne({ model: userModel, filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } } })
    if (!account) throw NotFoundException("invalid account")

    const hashOtp = await get({ key: UserEmailKey({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD }) })
    if (!hashOtp || !await compare(otp, hashOtp)) {
        throw ConflictException("invalid otp")
    }
    return account;
}

export const resetForgotPassword = async ({ otp, email, password }) => {
    const account = await verifyForgotPasswordCode({ otp, email })
    account.password = await hash(password);
    account.changeCredentialsTime = new Date();
    await account.save();
    const result = await Promise.all([
        await keys({ prefix: userBaseRevokeTokenkey({ userId: account._id }) }) ?? [],
        await keys({ prefix: UserEmailKey({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD }) }) ?? []
    ])

    await del({
        key: [...result[0], ...result[1]]
    })
    return;
}

export const login = async ({ email, password }, issuer) => {
    const attemptsKey = UserLoginAttemptsKey({ email })

    // check if user is blocked
    const currentAttempts = await get({ key: attemptsKey }) ?? 0
    if (currentAttempts >= 5) {
        const remainingSeconds = await ttl({ key: attemptsKey })
        throw TooManyRequestsException(`Too many failed login attempts, please try again in ${remainingSeconds} seconds`)
    }

    const account = await findOne({ model: userModel, filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } } })
    if (!account) throw NotFoundException("invalid Email or Password")

    const match = await compare(password, account.password)
    if (!match) {
        const failedAttempts = await incrBy({ key: attemptsKey })
        if (failedAttempts >= 5) {
            await expire({ key: attemptsKey, ttl: 300 }) // block for 5 minutes
        }
        throw NotFoundException("invalid Email or Password")
    }

    // login successful → clear failed attempts
    await del({ key: [attemptsKey] })
    return await createLoginCredentials({ user: account })
}