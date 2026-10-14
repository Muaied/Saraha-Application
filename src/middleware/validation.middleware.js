import { BadRequestException } from "../common/exceptions/index.js"
import { LanguageEnum } from "../common/enum/index.js"
//schema => validators.signup=> signup(lang)
export const validation = (schema) => {
    return (req, res, next) => {
        const lang = Number(req.headers['accept-language'] ?? LanguageEnum.EN)
        console.log({ lang });

        const validationResult = schema(lang).safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
            files: req.files,
            file: req.file
        })
        console.log({ validationResult });

        if (!validationResult.success) {
            throw BadRequestException("validation Error", { issues: validationResult.error.issues })
        }
        req.validate = validationResult.data
        next()
    }
}