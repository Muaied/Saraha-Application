import bcrypt from "bcrypt";

export const hash = async (plaintext, round = 12, minor = "b") => {
    const salt = (await bcrypt.genSalt(round, minor)).toString()
    return bcrypt.hash(plaintext, salt)
}
export const compare = async (plaintext, cipherText) => {
    return await bcrypt.compare(plaintext, cipherText)
}


