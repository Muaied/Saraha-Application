import { BadRequestException } from "../common/exceptions/index.js";
import { processMulterUpload } from "../common/utils/index.js";

export const uploadMidddleware = ({ isRequired = true, multerMiddleware, customPath = 'general', validation = [] } = {}) => {
    return async (req, res, next) => {

        multerMiddleware(req, res, async (error) => {
            if (error) {
                next(new Error(error.message, { cause: { status: 400 } }))
                return;
            }


            try {
                if (
                    isRequired &&
                    (!req.file && !(Array.isArray(req.files) && req.files.length) &&
                        !(typeof req.files === "object" && Object.keys(req.files)?.length))
                ) {
                    next(BadRequestException("File is required"))
                    return;
                }
                await processMulterUpload({ req, customPath, validation })
                next()
            } catch (error) {
                next(new Error(error.message, { cause: { status: 400 } }))

            }
        })


    }
}
