import { z } from "zod"
import { generalValidationFields } from "../../common/validation.js"

export const loginSchema = (lang) => {
    return z.strictObject({
        email: generalValidationFields.email(lang),
        password: generalValidationFields.password(lang)
    })

}


export const login = (lang) => {
    return z.object({
        body: loginSchema(lang)
    })
}

export const signup = (lang) => {
    return z.object({
        body: loginSchema(lang).safeExtend({
            username: generalValidationFields.username(lang),
            phone: generalValidationFields.phone(lang),
            confirmPassword: generalValidationFields.confirmPassword(lang),
            gender: generalValidationFields.gender(lang)
        }).superRefine((data, ctx) => {
            if (data.password !== data.confirmPassword) {
                ctx.addIssue({
                    code: "custom",
                    message: "Passwords don't match",
                    path: ["confirmPassword"]
                })
            }
            if (!data.username.includes(" ")) {
                ctx.addIssue({
                    code: "custom",
                    message: "username must contain space",
                    path: ["username"]
                })
            }
        })

    })
}
export const confirmEmail = (lang) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang),
            otp: generalValidationFields.otp(lang)

        })
    })
}

export const resendConfirmEmail = (lang) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang)

        })
    })
}

export const resetForgotPassword = (lang) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang),
            otp: generalValidationFields.otp(lang),
            password: generalValidationFields.password(lang),
            confirmPassword: generalValidationFields.password(lang),
        }).superRefine((data, ctx) => {
            if (data.password !== data.confirmPassword) {
                ctx.addIssue({
                    code: "custom",
                    message: "Passwords don't match",
                    path: ["confirmPassword"]
                })
            }
        })
    })
}



// .refine((data) => {
//     console.log({ data });
//     return data.email.includes("@gmail")

// }, { message: "invalid email" })