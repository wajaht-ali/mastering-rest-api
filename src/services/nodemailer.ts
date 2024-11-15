import nodemailer from 'nodemailer';
import { config } from '../config/config';

export const transporter = nodemailer.createTransport({
    host: `${config.EMAIL_HOST}`,
    port: 465,
    secure: true,
    auth: {
        user: `${config.My_Email}`,
        pass: `${config.My_Email_Password}`,
    },
    });

export const sendMail = async (to: string, subject: string, text: string) => {
    try {
        await transporter.sendMail({
            from: `${config.My_Email}`,
            to: to,
            subject: subject,
            html: text,
        });
    } catch (error) {
        console.log(error);
    }
}