import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'smtp.ethereal.email',
    port: Number(process.env.EMAIL_SERVER_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

export async function sendEmail(to: string, subject: string, html: string) {
    try {
        // If no credentials are setup, we might want to skip or use Ethereal explicitly
        // For this demo, if env vars are missing, we log to console (Mock)
        if (!process.env.EMAIL_SERVER_USER) {
            console.log("==========================================");
            console.log(`[MOCK EMAIL] To: ${to}`);
            console.log(`[MOCK EMAIL] Subject: ${subject}`);
            console.log(`[MOCK EMAIL] Body: ${html}`);
            console.log("==========================================");
            return { success: true, message: "Mock email logged to console" };
        }

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"ScanX Support" <noreply@scanx.local>',
            to,
            subject,
            html,
        });

        console.log("Message sent: %s", info.messageId);

        // Preview only available when sending through an Ethereal account
        if (nodemailer.getTestMessageUrl(info)) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        return { success: true, message: "Email sent successfully" };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, message: "Failed to send email" };
    }
}
