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

interface FriendCreationAttrs {
    from: number;
    to: number;
}

@Table({ tableName: 'friends' })
export class Friend extends Model<Friend, FriendCreationAttrs> {
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
        description: 'Уникальный идентификатор от кого заявка',
    })
    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    from: number;

    @BelongsTo(() => User, 'from')
    fromUser: User;

    @ApiProperty({
        example: '1',
        description: 'Уникальный идентификатор кому заявка',
    })
    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    to: number;

    @BelongsTo(() => User, 'to')
    toUser: User;

    @ApiProperty({ example: 'true', description: 'Отправлена заявка или нет' })
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    isRequested: boolean;

    @ApiProperty({ example: 'true', description: 'Принята заявка или нет' })
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    isAccepted: boolean;
}
