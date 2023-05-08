import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/users/users.model';
import { RegistrationUserDto } from 'src/auth/dto/registration-user.dto';

@Injectable()
export class EmailService {
    constructor(private mailerService: MailerService) {}

    async sendUserConfirmation(email: string, confirmCode: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Добро пожаловать в CHAT APP! Подтвердите почту',
            template: './confirmCode',
            context: {
                confirmCode,
            },
        });
    }

    async sendUserRegistration(user: RegistrationUserDto) {
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Добро пожаловать в CHAT APP!',
            template: './registration',
            context: {
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    }
}
