import mongoose from "mongoose";
import { GenderEnum, RoleEnum } from "../../common/enum/index.js";
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minLength: 2,
        maxLength: 25,
        required: true
    }, lastName: {
        type: String,
        minLength: 2,
        maxLength: 25,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    phone: String,
    DOB: Date,
    confirmEmail: Date,
    image: String,
    coverImage: [String],
    gender: {
        type: Number,
        enum: Object.values(GenderEnum),
        default: GenderEnum.MALE,
    },
    role: {
        type: Number,
        default: RoleEnum.USER,
        enum: Object.values(RoleEnum)
    },
    changeCredentialsTime: Date

}, {
    timestamps: true,
    toObject: true,
    toJSON: true,
    strictQuery: true,
    strict: true,
    autoIndex: true
})
userSchema.virtual("username").set(function (value) {
    if (value) {
        const [firstName, lastName] = value.split(" ")
        this.set({ firstName, lastName })
    }
}).get(function () {
    return `${this.firstName} ${this.lastName}`
})
export const userModel = mongoose.models.user || mongoose.model("user", userSchema)