import { findByIdAndUpdate } from "../../common/repository/index.js"
import { userModel } from "../../DB/model/index.js"
import { createLoginCredentials, createRevokeToken, createToken, userBaseRevokeTokenkey } from "../../common/security/token.security.js"
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../../config.js"
import { ConflictException } from "../../common/exceptions/error.exception.js"
import { LogoutEnum } from "../../common/enum/security.enum.js"
import { set, del, keys } from "../../common/services/index.js"

export const profile = async (account) => {
    return account
}

export const update = async (user, data) => {
    const account = await findByIdAndUpdate({
        model: userModel,
        id: user._id,
        update: data
    })
    return account
}

export const rotateToken = async (payload, user, issuer) => {
    const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000
    const currentTime = Date.now() + (30 * 60000)
    if (currentTime < accessExpiresIn) {
        throw ConflictException("Sorry we cannot create new login credentials while current access token is still available")
    }


    const data = await createLoginCredentials({ user, issuer })
    await createRevokeToken(payload)
    return data

}

export const logout = async (payload, user, { action = LogoutEnum.DEVICE }) => {
    console.log({ user });


    switch (action) {
        case LogoutEnum.ALL:
            user.changeCredentialsTime = new Date();
            await user.save()
            const revokeKeys = await keys({ prefix: userBaseRevokeTokenkey({ userId: payload.sub }) })
            if (revokeKeys.length) await del({ key: revokeKeys })
            break;
        default:
            await createRevokeToken(payload)
            break;
    }
    return
}