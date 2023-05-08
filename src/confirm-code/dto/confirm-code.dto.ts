import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ConfirmCodeDto {
    @ApiProperty({ example: 'user@mail.ru', description: 'Почта' })
    @IsString({ message: 'Должно быть строкой' })
    @IsEmail({}, { message: 'Некорректный email' })
    readonly email: string;

    @ApiProperty({ example: 'qwerty', description: 'Код подтверждения' })
    @IsString({ message: 'Должно быть строкой' })
    readonly confirmCode: string;
}
