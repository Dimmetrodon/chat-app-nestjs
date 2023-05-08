import { ConfirmCodeService } from './../confirm-code/confirm-code.service';
import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegistrationUserDto } from './dto/registration-user.dto';
import { CreateConfirmCodeDto } from 'src/confirm-code/dto/create-confirm-code.dto';
import { ConfirmCodeDto } from 'src/confirm-code/dto/confirm-code.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard, RequestUser } from './jwt-auth.guard';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private confirmCodeService: ConfirmCodeService
    ) {}

    @ApiOperation({ summary: 'Войти в аккаунт' })
    @ApiResponse({ status: 200 })
    @Post('/login')
    login(
        @Body() userDto: LoginUserDto,
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.login(userDto, response);
    }

    @ApiOperation({ summary: 'Зарегистрировать нового пользователя' })
    @ApiResponse({ status: 200 })
    @Post('/registration')
    registration(
        @Body() userDto: RegistrationUserDto,
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.registration(userDto, response);
    }

    @ApiOperation({
        summary: 'Сгенерировать код подтверждения и отправить на почту',
    })
    @ApiResponse({ status: 200 })
    @Post('/confirm/email')
    confirmEmail(@Body() confirmCodeDto: CreateConfirmCodeDto) {
        return this.confirmCodeService.generateCode(confirmCodeDto);
    }

    @ApiOperation({ summary: 'Подтвердить почту через код' })
    @ApiResponse({ status: 200 })
    @Post('/confirm/code')
    confirmCode(@Body() confirmCodeDto: ConfirmCodeDto) {
        return this.confirmCodeService.confirmCode(confirmCodeDto);
    }

    @ApiOperation({
        summary: 'Обновить информацию о том, что пользователь в сети',
    })
    @ApiResponse({ status: 200 })
    @Get('/checkout')
    @UseGuards(JwtAuthGuard)
    checkout(
        @Req() request: RequestUser,
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.checkout(request, response);
    }

    @ApiOperation({ summary: 'Выйти из аккаунта' })
    @ApiResponse({ status: 200 })
    @Get('/logout')
    @UseGuards(JwtAuthGuard)
    logout(
        @Req() request: RequestUser,
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.logout(request, response);
    }
}
