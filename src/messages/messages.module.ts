import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { Message } from './messages.model';
import { ChatsModule } from 'src/chats/chats.module';

@Module({
    controllers: [MessagesController],
    providers: [MessagesService],
    imports: [
        SequelizeModule.forFeature([Message]),
        JwtModule.register({
            secret: process.env.PRIVATE_KEY || 'SECRET',
            signOptions: {
                expiresIn: '24h',
            },
        }),
        forwardRef(() => UsersModule),
        forwardRef(() => ChatsModule),
    ],
    exports: [MessagesService],
})
export class MessagesModule {}
