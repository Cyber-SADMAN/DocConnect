import EmailService from '../src/app/services/EmailService';
import { Request, Response, Router } from 'express';
import Hash from '../src/utils/Hash';

const testRoutes: Router = Router();

// email test
const emailService = new EmailService();
testRoutes.get('/email', async (request: Request, response: Response) => {
    const recipients = ['arifmahfuz99@gmail.com'];
    const subject = 'Appointment Confirmation';

    // const emailBody = await new Promise<string>((resolve, reject) => {
    //     response.render(
    //         'otp-verification.html',
    //         { name: 'Arif Mahfuz', doctor: 'Dr. John Doe', code: 'ASDF3435' },
    //         (err, html) => {
    //             if (err) {
    //                 reject(err);
    //             } else {
    //                 resolve(html);
    //             }
    //         }
    //     );
    // });

    const emailBody = await new Promise<string>((resolve, reject) => {
        response.render(
            'confirmation.html',
            {
                name: 'Arif Mahfuz',
                doctor: 'Dr. John Doe',
                appointmentDate: '20th June, 2022',
                appointmentTime: '10:00 AM',
            },
            (err, html) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(html);
                }
            }
        );
    });

    // await emailService.sendMail(recipients, subject, emailBody);
    // response.json({ success: true });

    // render as html the emailBody is the html

    return response.send(emailBody);
});

testRoutes.post(
    '/make-hashed-password',
    async (request: Request, response: Response) => {
        const { password } = request.body;
        const hashedPassword = await Hash.make(password);
        response.json({ success: true, hashedPassword });
    }
);

export default testRoutes;
