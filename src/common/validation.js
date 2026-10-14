import { z } from 'zod'
import { GenderEnum, LanguageEnum } from "./enum/index.js"
import mongoose from 'mongoose'
const validationMessages = {
    1: {
        ar: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل",
        en: "username must be at least 3 characters"
    },
    2: {
        ar: "اسم المستخدم يجب أن يكون 20 حرفا على الأكثر",
        en: "username must be at most 20 characters"
    },
    3: {
        ar: "البريد الالكتروني غير صحيح",
        en: "invalid email"
    },
    4: {
        ar: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
        en: "password must be at least 8 characters"
    },
    5: {
        ar: "كلمة المرور يجب أن تكون 16 حرفا على الأكثر",
        en: "password must be at most 16 characters"
    },
    6: {
        ar: "الجنس غير صحيح",
        en: "invalid gender"
    },
    7: {
        ar: "كلمة المرور غير صحيحة",
        en: "invalid password"
    },
    8: {
        ar: "رمز التحقق يجب أن يكون 6 أرقام",
        en: "OTP must be a 6-digit number"
    }

}

const getValidationMessage = (lang, code) => {
    return lang == LanguageEnum.AR ?
        validationMessages[code].ar
        : validationMessages[code].en
}


export const generalValidationFields = {
    email: (lang) => z.email({ message: getValidationMessage(lang, 3) }),
    password: (lang) => z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_+=\[\]{}|\\:;'"<>,.\/]).{8,16}$/, { error: getValidationMessage(lang, 7) }),
    username: (lang) => z.string().min(3, { message: getValidationMessage(lang, 1) }).max(20, { message: getValidationMessage(lang, 2) }),
    phone: (lang) => z.e164(),
    confirmPassword: (lang) => z.string().min(8, { message: getValidationMessage(lang, 4) }).max(16, { message: getValidationMessage(lang, 5) }),
    gender: (lang) => z.enum(GenderEnum, { message: getValidationMessage(lang, 6) }),
    otp: (lang) => z.string().length(6, { message: getValidationMessage(lang, 8) }).regex(/^\d{6}$/, { message: getValidationMessage(lang, 8) }),
    id: (lang) => z.string().refine((data) => { return mongoose.Types.ObjectId.isValid(data) }, { message: "invalid format" }),
    file: (lang) => z.strictObject({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string(),
        size: z.number(),
        path: z.string(),
        buffer: z.instanceof(Buffer)
    })
}