import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        minLength: 2,
        maxLength: 50000,
        required: function () { return this.attachments?.length > 0 ? false : true }
    }, attachments: [String],
    senderId: {
        type: mongoose.Types.ObjectId,
        ref: "user"
    },
    receiverId: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true
    },


}, {
    timestamps: true,
    toObject: true,
    toJSON: true,
    strictQuery: true,
    strict: true,
    autoIndex: true
})
export const messageModel = mongoose.models.message || mongoose.model("message", messageSchema)