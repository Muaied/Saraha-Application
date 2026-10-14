import jwt from "jsonwebtoken"
import { ACCESS_USER_TOKEN_SIGNATURE, REFRESH_USER_TOKEN_SIGNATURE, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, ACCESS_ADMIN_TOKEN_SIGNATURE, REFRESH_ADMIN_TOKEN_SIGNATURE } from "../../config.js"
import { BadRequestException, NotFoundException, UnAuthorizedException } from "../exceptions/error.exception.js"
import { findById } from "../repository/base.repository.js"
import { userModel } from "../../DB/model/index.js"
import { TokenTypeEnum } from "../enum/security.enum.js"
import { RoleEnum } from "../enum/user.gender.js"
import { randomUUID } from "crypto"
import { exists, set } from "../services/index.js"

export const userBaseKey = ({ userId }) => {
    return `User::${userId.toString()}`
}

export const userBaseRevokeTokenkey = ({ userId }) => {
    return `${userBaseKey({ userId })}::Revoke_Token`
}
export const userRevokeTokenKey = ({ userId, jti }) => {
    return `${userBaseRevokeTokenkey({ userId })}::${jti}`
}


export const createToken = ({
    payload = {},
    options = {},
    secret = ACCESS_USER_TOKEN_SIGNATURE
} = {}) => {
    return jwt.sign(payload, secret, options)
}

export const verifyToken = async ({
    token = "",
    secret = ACCESS_USER_TOKEN_SIGNATURE
} = {}) => {
    return jwt.verify(token, secret)
}

const getTokenSignature = ({ role = RoleEnum.USER } = {}) => {
    let signatures;
    switch (role) {
        case RoleEnum.ADMIN:
            signatures = { accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE, refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE }
            break;
        default:
            signatures = { accessSignature: ACCESS_USER_TOKEN_SIGNATURE, refreshSignature: REFRESH_USER_TOKEN_SIGNATURE }
            break;
    }
    return signatures
}

const getSignature = ({ tokenType = TokenTypeEnum.ACCESS, role = RoleEnum.USER } = {}) => {
    const signatures = getTokenSignature({ role })
    return tokenType == TokenTypeEnum.ACCESS ? signatures.accessSignature : signatures.refreshSignature
}


export const decodeToken = async ({
    authorization = "",
    tokenType = TokenTypeEnum.ACCESS
} = {}) => {
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : authorization
    const decoded = jwt.decode(token)
    if (!decoded?.aud?.length) {
        throw BadRequestException("missing token payload")
    }
    const role = parseInt(decoded.aud[0])
    const payload = await verifyToken({ token, secret: getSignature({ tokenType, role }) })
    if (!payload?.sub) {
        throw BadRequestException("missing token payload")
    }
    if (await exists({ key: userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }) })) {

        throw UnAuthorizedException("Expired login credentials")
    }
    const user = await findById({
        model: userModel,
        id: payload.sub
    })
    if (!user) {
        throw NotFoundException("invalid user")
    }
    if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
        throw UnAuthorizedException("Expired login credentials")
    }

    return { payload, user }
}

export const createLoginCredentials = async ({
    user,
    role = RoleEnum.USER,
    options = {},
    issuer = ""
} = {}) => {
    const { accessSignature, refreshSignature } = getTokenSignature({ role: user.role })
    const jwtid = randomUUID()
    const access_token = await createToken({
        payload: { sub: user._id },
        secret: accessSignature,
        options: {
            ...options,
            ...(issuer && { issuer }),
            audience: [String(user.role)],
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
            jwtid
        }
    })
    const refresh_token = await createToken({
        payload: { sub: user._id },
        options: {
            ...options,
            ...(issuer && { issuer }),
            audience: [String(user.role)],
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
            jwtid
        },
        secret: refreshSignature
    })


    return { access_token, refresh_token }
}

export const createRevokeToken = async (payload) => {
    const currentTime = Math.ceil(Date.now() / 1000)
    const refreshExpiresIn = payload.iat + REFRESH_TOKEN_EXPIRES_IN
    const ttl = refreshExpiresIn - currentTime
    await set({ key: userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }), value: payload.jti, ttl })
    return;
}