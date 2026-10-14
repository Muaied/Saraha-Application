export const ApplicationException = ({
    message = "error",
    options = {
        cause: { status: 400 }
    }

} = {}) => {
    return new Error(message, options)
}
export const ConflictException = (message = 'Conflict', extra = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 409, ...extra }
        }
    })
}


export const TooManyRequestsException = (message = 'Too Many Requests', extra = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 429, ...extra }
        }
    })
}

export const NotFoundException = (message = 'Not found', extra = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 404, ...extra }
        }
    })
}
export const BadRequestException = (message = 'Bad Request', extra = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 400, ...extra }
        }
    })
}
export const UnAuthorizedException = (message = 'Unauthorized', extra = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 401, ...extra }
        }
    })
}
export const ForbiddenException = (message = 'Forbidden', extra = {}) => {
    return ApplicationException({
        message,
        options: {
            cause: { status: 403, ...extra }
        }
    })
}
