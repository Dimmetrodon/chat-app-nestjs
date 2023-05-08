import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from './messages.model';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/users.model';
import { RequestUser } from 'src/auth/jwt-auth.guard';
import { forwardRef } from '@nestjs/common/utils';
import { ChatsService } from 'src/chats/chats.service';

@Injectable()
export class MessagesService {
    constructor(
        @InjectModel(Message) private messageRepository: typeof Message,
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
        @Inject(forwardRef(() => ChatsService))
        private chatsService: ChatsService
    ) {}

    async findMessagesByChat(id: number) {
        const messages = await this.messageRepository.findAll({
            where: {
                chatId: id,
            },
            attributes: ['id', 'text', 'createdAt'],
            include: {
                model: User,
                attributes: [
                    'id',
                    'email',
                    'firstName',
                    'lastName',
                    'avatar',
                    'lastSeen',
                ],
            },
        });
        return messages;
    }

    async createMessage(userId: number, id: number, text: string) {
        await this.usersService.updateLastSeen(userId);
        if (userId == id) {
            throw new HttpException(
                'Requesting user and accepting user are the same person',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        const chat = await this.chatsService.getChat(userId, id);

        if (!chat.id) {
            const newChat = await this.chatsService.createNewChat(userId, id);
            chat.id = newChat.id;
        }

        const message = await this.messageRepository.create({
            userId,
            chatId: chat.id,
            text: text.trim(),
        });
        await this.chatsService.updateMessageId(chat.id, message.id);
        const response = await this.messageRepository.findOne({
            where: { id: message.id },
            include: {
                model: User,
                attributes: [
                    'id',
                    'email',
                    'firstName',
                    'lastName',
                    'avatar',
                    'lastSeen',
                ],
            },
        });
        return response;
    }

    async findMessage(id: number) {
        return await this.messageRepository.findOne({ where: { id } });
    }
}
