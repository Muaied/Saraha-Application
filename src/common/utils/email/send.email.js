import nodemailer from "nodemailer";
import { APP_EMAIL, APP_PASSWORD, APPLICATION_NAME } from "../../../config.js";
import { BadRequestException } from "../../exceptions/error.exception.js";
export const UserEmailKey = ({ email, subject }) => {
    return `User::${email}::${subject}::OTP`
}
export const UserEmailTrailsKey = ({ email, subject }) => {
    return `${UserEmailKey({ email, subject })}::Trails`
}
export const UserLoginAttemptsKey = ({ email }) => {
    return `User::${email}::Login::Attempts`
}
// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: APP_EMAIL,
        pass: APP_PASSWORD,
    },
});


export const sendEmail = async ({
    to, // list of recipients
    subject, // subject line
    cc,
    bcc,
    text, // plain text body
    html, // HTML body
    attachments = [] //attachments
}) => {
    try {
        if (!to?.length && !bcc?.length && !cc?.length) {
            throw BadRequestException("Missing email recipients");
        }
        if (!text?.length && !html?.length && !attachments?.length) {
            throw BadRequestException("Missing email content");
        }
        const info = await transporter.sendMail({
            from: `"${APPLICATION_NAME}" <${APP_EMAIL}>`, // sender address
            to, // list of recipients
            subject, // subject line
            cc,
            bcc,
            text, // plain text body
            html, // HTML body
            attachments, //attachments
        });

        console.log("Message sent: %s", info.messageId);
        // Preview URL is only available when using an Ethereal test account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (err) {
        console.error("Error while sending mail:", err);
    }
}