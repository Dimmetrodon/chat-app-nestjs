import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/users.model';
import { Chat } from 'src/chats/chats.model';

interface MessageCreationAttrs {
    userId: number;
    chatId: number;
    text: string;
}

@Table({ tableName: 'messages' })
export class Message extends Model<Message, MessageCreationAttrs> {
    @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    })
    id: number;

    @ApiProperty({
        example: '1',
        description: 'Уникальный идентификатор от кого сообщение',
    })
    @ForeignKey(() => User)
    @Column
    userId: number;

    @BelongsTo(() => User, 'userId')
    user: User;

    @ApiProperty({
        example: '1',
        description: 'Уникальный идентификатор чата, куда отправлено сообщение',
    })
    @ForeignKey(() => Chat)
    @Column
    chatId: number;

    @BelongsTo(() => Chat, 'chatId')
    chat: Chat;

    @ApiProperty({ example: 'Hello world!', description: 'Текст сообщения' })
    @Column({ type: DataType.TEXT })
    text: string;
}
