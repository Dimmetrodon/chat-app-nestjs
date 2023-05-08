import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'user@mail.ru', description: 'Почта' })
    @IsString({ message: 'Email должен быть строкой' })
    @IsEmail({}, { message: 'Некорректный email' })
    readonly email: string;

    @ApiProperty({ example: '12345', description: 'Пароль' })
    @IsString({ message: 'Пароль должен быть строкой' })
    @MinLength(4, {
        message: 'Пароль должен быть не меньше 4 символов',
    })
    @MaxLength(127, {
        message: 'Пароль должен быть не больше 127 символов',
    })
    readonly password: string;

    @Matches(/^[a-zA-Zа-яА-Я]+$/, {
        message:
            'Имя может состоять только из букв русского иили латинского алфавита',
    })
    @ApiProperty({ example: '12345', description: 'Имя' })
    @IsString({ message: 'Имя должно быть строкой' })
    readonly firstName: string;

    @Matches(/^[a-zA-Zа-яА-Я]+$/, {
        message:
            'Имя может состоять только из букв русского иили латинского алфавита',
    })
    @ApiProperty({ example: '12345', description: 'Фамилия' })
    @IsString({ message: 'Фамилия должна быть строкой' })
    readonly lastName: string;
}
