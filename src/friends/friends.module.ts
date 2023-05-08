import { forwardRef, Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { UsersModule } from '../users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Friend } from './friends.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
    controllers: [FriendsController],
    providers: [FriendsService],
    imports: [
        SequelizeModule.forFeature([Friend]),
        JwtModule.register({
            secret: process.env.PRIVATE_KEY || 'SECRET',
            signOptions: {
                expiresIn: '24h',
            },
        }),
        forwardRef(() => UsersModule),
    ],
    exports: [FriendsService],
})
export class FriendsModule {}
