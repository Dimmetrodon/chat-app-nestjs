import { ConfirmCodeService } from './../confirm-code/confirm-code.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/users.model';
import { LoginUserDto } from './dto/login-user.dto';
import { RegistrationUserDto } from './dto/registration-user.dto';
import { EmailService } from 'src/email/email.service';
import { Response } from 'express';
import { RequestUser } from './jwt-auth.guard';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
        private confirmCodeService: ConfirmCodeService,
        private emailService: EmailService
    ) {}

    async login(userDto: LoginUserDto, response: Response) {
        const user = await this.validateUser(userDto);
        await this.userService.updateLastSeen(user.id);
        const accessToken = await this.generateToken(user, '1d');
        const refreshToken = await this.generateToken(user, '30d');
        response.cookie('refreshToken', refreshToken);

        // @ts-ignore
        delete user.dataValues.password;

        return { user, accessToken };
    }

    async registration(userDto: RegistrationUserDto, response: Response) {
        const candidate = await this.userService.getUserByEmail(userDto.email);
        if (candidate) {
            throw new HttpException(
                'Пользователь с таким email существует',
                HttpStatus.BAD_REQUEST
            );
        }
        const {
            confirmed,
        } = await this.confirmCodeService.getConfirmCodeByEmail(userDto.email);
        if (!confirmed) {
            throw new HttpException(
                'Код не подтвержден',
                HttpStatus.BAD_REQUEST
            );
        }

        const hashPassword = await bcrypt.hash(userDto.password, 5);
        const user = await this.userService.createUser({
            ...userDto,
            password: hashPassword,
        });
        await this.emailService.sendUserRegistration(userDto);
        const accessToken = await this.generateToken(user, '1d');
        const refreshToken = await this.generateToken(user, '30d');
        response.cookie('refreshToken', refreshToken);
        await this.confirmCodeService.removeConfirmCode(user.email);

        // @ts-ignore
        delete user.dataValues.password;

        return { user, accessToken };
    }

    async logout(request: RequestUser, response: Response) {
        const { id } = request.user;
        await this.userService.updateLastSeen(id);
        response.clearCookie('refreshToken');
        return { OK: 1 };
    }

    async checkout(request: RequestUser, response: Response) {
        const { id } = request.user;
        const user = await this.userService.getUserById(id);
        await this.userService.updateLastSeen(id);
        const accessToken = await this.generateToken(user, '1d');
        const refreshToken = await this.generateToken(user, '30d');
        response.cookie('refreshToken', refreshToken);
        return { user, accessToken };
    }

    private async generateToken(user: User, expiresIn: string) {
        const payload = { email: user.email, id: user.id };
        const token = await this.jwtService.sign(payload, {
            expiresIn,
        });
        return token;
    }

    private async validateUser(userDto: LoginUserDto) {
        const user = await this.userService.getUserByEmail(userDto.email);
        if (user) {
            const passwordEquals = await bcrypt.compare(
                userDto.password,
                user.password
            );
            if (passwordEquals) {
                return user;
            }
        }
        throw new HttpException(
            'Некорректный email или пароль',
            HttpStatus.BAD_REQUEST
        );
    }
}
