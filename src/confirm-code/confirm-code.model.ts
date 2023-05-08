import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

interface ConfirmCodeCreationAttrs {
    email: string;
    confirmCode: string;
}

@Table({ tableName: 'confirmCodes' })
export class ConfirmCode extends Model<ConfirmCode, ConfirmCodeCreationAttrs> {
    @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    })
    id: number;

    @ApiProperty({ example: 'user@mail.ru', description: 'Почтовый адрес' })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    email: string;

    @ApiProperty({ example: '12345678', description: 'Код подтверждения' })
    @Column({ type: DataType.STRING, allowNull: false })
    confirmCode: string;

    @ApiProperty({ example: 'true', description: 'Подтвержден' })
    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
    confirmed: boolean;
}
