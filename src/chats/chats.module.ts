import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { Chat } from './chats.model';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
    controllers: [ChatsController],
    providers: [ChatsService],
    imports: [
        SequelizeModule.forFeature([Chat]),
        JwtModule.register({
            secret: process.env.PRIVATE_KEY || 'SECRET',
            signOptions: {
                expiresIn: '24h',
            },
        }),
        forwardRef(() => UsersModule),
        forwardRef(() => MessagesModule),
    ],
    exports: [ChatsService],
})
export class ChatsModule {}
