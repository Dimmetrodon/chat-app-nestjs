import { EmailModule } from './../email/email.module';
import { ConfirmCode } from './confirm-code.model';
import { Module, forwardRef } from '@nestjs/common';
import { ConfirmCodeService } from './confirm-code.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/users/users.model';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    providers: [ConfirmCodeService],
    imports: [
        SequelizeModule.forFeature([ConfirmCode]),
        SequelizeModule.forFeature([User]),
        EmailModule,
        forwardRef(() => UsersModule),
        forwardRef(() => AuthModule),
    ],
    exports: [ConfirmCodeService],
})
export class ConfirmCodeModule {}
