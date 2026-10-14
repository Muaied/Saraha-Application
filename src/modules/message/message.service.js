import { messageModel, userModel } from "../../DB/model/index.js"
import { createOne, deleteOne, findById, findOne, paginate } from "../../common/repository/index.js"
import { NotFoundException } from "../../common/exceptions/error.exception.js"

export const createMessage = async ({ content, receiverId }, files = [], user = undefined) => {

    const checkReceiverExist = await findById(
        {
            model: userModel,
            id: receiverId
        }
    )

    if (!checkReceiverExist) {
        throw NotFoundException("Receiver not found")
    }
    const message = await createOne({
        model: messageModel,
        data: {
            content,
            receiverId,
            attachments: files?.map(ele => ele.path),
            ...(user ? { senderId: user._id } : {})
        }
    })
    return message;
}


export const getAllMessages = async ({ type, page, limit } = {}, user) => {
    let filter = {}
    if (type == "0") {
        filter = { receiverId: user._id }
    } else if (type == "1") {
        filter = { senderId: user._id }
    } else {
        filter = {
            $or: [
                { senderId: user._id },
                { receiverId: user._id }
            ]

        }
    }
    const data = await paginate({ model: messageModel, page, limit, filter, options: { sort: { createdAt: -1 } } })

    return data
}

export const deleteMessage = async ({ messageId }, user) => {
    const data = await deleteOne({ model: messageModel, filter: { receiverId: user._id, _id: messageId } })
    if (!data.deletedCount) {
        throw NotFoundException("message not found")
    }
    return data;
}

export const getMessage = async ({ messageId }, user) => {
    const data = await findOne({ model: messageModel, filter: { receiverId: user._id, _id: messageId } })
    if (!data) {
        throw NotFoundException("message not found")
    }
    return data;
}