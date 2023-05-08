import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { EmailService } from './email.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.${process.env.NODE_ENV}.env`,
        }),
        MailerModule.forRoot({
            transport: {
                host: 'smtp.gmail.com',
                secure: true,
                auth: {
                    user: String(process.env.EMAIL),
                    pass: String(process.env.PASSWORD),
                },
            },
            defaults: {
                from: '"No Reply" <noreply@example.com>',
            },
            template: {
                dir: join(__dirname, 'templates'),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        }),
    ],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {}
