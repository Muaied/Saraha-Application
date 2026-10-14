import { ForbiddenException, UnAuthorizedException } from "../common/exceptions/error.exception.js"
import { decodeToken } from "../common/security/token.security.js"
import { TokenTypeEnum } from "../common/enum/index.js"
export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const { authorization } = req.headers

        if (!authorization) {
            throw UnAuthorizedException("unauthorized account")
        }
        const [key, credential] = authorization.split(" ") || []
        const { user, payload } = await decodeToken({ authorization: credential, tokenType })

        req.user = user
        req.payload = payload
        next()
    }
}


export const authorization = ({ accessRole }) => {
    return async (req, res, next) => {
        if (req.user.role < accessRole) {
            throw ForbiddenException("Forbidden Account")
        }
        next()
    }
}