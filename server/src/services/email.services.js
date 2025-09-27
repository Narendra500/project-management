import transporter from "#config/nodemailer";
import logger from "#utils/logger";

async function sendEmail({ to, subject, html }) {
    const mailOptions = {
        from: `"Orbit" <${process.env.EMAIL_ADDRESS}>`, // Sender name and address
        to: to,
        subject: subject,
        html: html, // HTML body
    };

    //  Send the email
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.response}`);

    return { success: true, message: "Email sent successfully." };
}

export default sendEmail;
