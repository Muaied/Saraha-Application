import { Router } from 'express'
import { successResponse } from '../../common/utils/response.utils.js';
import { profile, update, rotateToken, logout } from './user.service.js';
import { authentication, authorization } from '../../middleware/authentication.middelware.js';
import { TokenTypeEnum } from '../../common/enum/security.enum.js';
import { RoleEnum } from '../../common/enum/user.gender.js';
import { localFileUpload, fileValidation } from '../../common/utils/multer/index.js';
import { uploadMidddleware } from '../../middleware/multer.middleware.js';
const router = Router()

router.patch('/profile-image',
    authentication(),
    uploadMidddleware({
        isRequired: false,
        multerMiddleware: localFileUpload({ maxFileSize: 1 }).single('attachment'),
        customPath: "users",
        validation: fileValidation.image
    }),
    async (req, res, next) => {
        return successResponse({ res, data: { file: req.file ?? req.files } })
    })



router.get('/', authentication(), async (req, res, next) => {
    const data = await profile(req.user)
    return successResponse({ res, data })
})
router.patch('/', authentication(), authorization({ accessRole: RoleEnum.ADMIN }), async (req, res, next) => {
    const data = await update(req.user, req.body)
    return successResponse({ res, data })
})
router.post('/rotate-token', authentication(TokenTypeEnum.REFRESH), async (req, res, next) => {
    const data = await rotateToken(req.payload, req.user, `${req.protocol}://${req.host}`)
    return successResponse({ res, data })
})
router.post('/logout', authentication(), async (req, res, next) => {
    const data = await logout(req.payload, req.user, req.body)
    return successResponse({ res, data })
})

export default router;