import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    // 1. Create a Transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, // e.g., smtp.gmail.com
        port: process.env.EMAIL_PORT, // 587 or 465
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2. Define Email Options
    const mailOptions = {
        from: `"CareerAnvil Security" <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        html: options.message // We will use HTML for better styling
    };

    // 3. Send Email
    await transporter.sendMail(mailOptions);
};

export default sendEmail;