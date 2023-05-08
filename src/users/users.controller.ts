import { UpdateProfileInfoDto } from './dto/update-profile-info.dto';
import {
    Body,
    Controller,
    Get,
    Param,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './users.model';
import { UsersService } from './users.service';
import { JwtAuthGuard, RequestUser } from '../auth/jwt-auth.guard';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @ApiOperation({ summary: 'Получить всех пользователей' })
    @ApiResponse({ status: 200, type: [User] })
    @UseGuards(JwtAuthGuard)
    @Get()
    getAll() {
        return this.usersService.getAllUsers();
    }

    @ApiOperation({ summary: 'Найти пользователя по id' })
    @ApiResponse({ status: 200, type: User })
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    getById(@Param('id') id: number, @Req() request: RequestUser) {
        return this.usersService.getUserById(id, request);
    }

    @ApiOperation({ summary: 'Обновить информацию профиля' })
    @ApiResponse({ status: 200, type: User })
    @UseGuards(JwtAuthGuard)
    @Put()
    updateProfileInfo(
        @Req() request: RequestUser,
        @Body() data: UpdateProfileInfoDto
    ) {
        return this.usersService.updateProfileInfo(request, data);
    }
}
