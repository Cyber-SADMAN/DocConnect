import { createTransport } from 'nodemailer';

class EmailService {
    private transporter;

    constructor() {
        this.transporter = createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // Use `true` for port 465, `false` for all other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendMail(recipients: string[], subject: string, html: string) {
        try {
            await this.transporter.sendMail({
                from: `"DocConnect" <${process.env.SMTP_USER}>`, // sender address
                to: recipients, // list of receivers
                subject, // Subject line
                html, // html body
            });
        } catch (error: any) {
            console.error(error);
            throw new Error(error.message || 'Something went wrong');
        }
    }
}

export default EmailService;
