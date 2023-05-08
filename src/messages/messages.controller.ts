import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
    OnModuleInit,
} from '@nestjs/common';
import { IGrpcService } from './grpc.interface';
import { Client, ClientGrpc, Transport } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RequestUser } from '../auth/jwt-auth.guard';
import { MessagesService } from './messages.service';

@ApiTags('Сообщения')
@Controller('messages')
export class MessagesController implements OnModuleInit {
    constructor(private messageService: MessagesService) {}

    @Client({ transport: Transport.TCP })
    private client: ClientGrpc;

    private grpcService: IGrpcService;

    onModuleInit() 
    {
        this.grpcService = this.client.getService<IGrpcService>('AppController');
    }

    @Post('add')
    async accumulate(@Body('data') data: number[]) 
    {
        console.log('Adding ' + data.toString());
        return this.grpcService.accumulate({ data });
    }

    @Post('test')
    async accumulate1(@Body('data') data: number[]) 
    {
        console.log('test');
        return;
    }

    @ApiOperation({ summary: 'отправка сообщения' })
    @ApiResponse({ status: 200 })
    @Post(':id')
    @UseGuards(JwtAuthGuard)
    findChat(
        @Param('id') id: number,
        @Req() request: RequestUser,
        @Body() body: { text: string }
    ) {
        const { id: userId } = request.user;
        return this.messageService.createMessage(userId, +id, body.text);
    }
}
