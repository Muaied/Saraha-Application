import { Router } from "express";
import { successResponse } from "../../common/utils/index.js"
import { createMessage, getAllMessages, deleteMessage, getMessage } from "./message.service.js"
import { uploadMidddleware } from "../../middleware/multer.middleware.js";
import { localFileUpload, fileValidation } from "../../common/utils/multer/local.multer.js"
import * as validators from "./message.validation.js"
import { validation } from "../../middleware/validation.middleware.js";
import { authentication } from "../../middleware/authentication.middelware.js";
const router = Router()

const messageFolderName = "messages"
router.post(
        "/",
        uploadMidddleware({
                multerMiddleware: localFileUpload().any("attachments", 3),
                validation: fileValidation.image,
                customPath: messageFolderName,
                isRequired: false
        }),
        validation(validators.createMessage),
        async (req, res, next) => {
                const data = await createMessage(req.body, req.files, req.user)
                return successResponse({ res, status: 201, data })
        })
router.post(
        "/by-account",
        authentication(),
        uploadMidddleware({
                multerMiddleware: localFileUpload().any("attachments", 3),
                validation: fileValidation.image,
                customPath: messageFolderName,
                isRequired: false
        }),
        validation(validators.createMessage),
        async (req, res, next) => {
                const data = await createMessage(req.body, req.files, req.user)
                return successResponse({ res, status: 201, data })
        })
router.get(
        "/",
        authentication(),
        validation(validators.allMessages),
        async (req, res, next) => {
                const data = await getAllMessages(req.query, req.user)
                return successResponse({ res, data })
        }
)
router.get(
        "/:messageId",
        authentication(),
        validation(validators.deleteMessage),
        async (req, res, next) => {
                const data = await getMessage(req.validate.params, req.user)
                return successResponse({ res, data })
        }
)
router.delete(
        "/:messageId",
        authentication(),
        validation(validators.deleteMessage),
        async (req, res, next) => {
                const data = await deleteMessage(req.validate.params, req.user)
                return successResponse({ res, data })
        }
)

export default router