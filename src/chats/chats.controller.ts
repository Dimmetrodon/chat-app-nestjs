import {
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RequestUser } from '../auth/jwt-auth.guard';
import { ChatsService } from './chats.service';

@ApiTags('Чаты')
@Controller('chats')
export class ChatsController {
    constructor(private chatsService: ChatsService) {}

    @ApiOperation({ summary: 'вывод чата' })
    @ApiResponse({ status: 200 })
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    getChat(@Param('id') id: number, @Req() request: RequestUser) {
        const { id: userId } = request.user;
        return this.chatsService.getChat(userId, +id);
    }

    @ApiOperation({ summary: 'вывод чатов' })
    @ApiResponse({ status: 200 })
    @Get()
    @UseGuards(JwtAuthGuard)
    getAllChats(@Req() request: RequestUser) {
        const { id: userId } = request.user;
        return this.chatsService.getAllChats(userId);
    }
}
