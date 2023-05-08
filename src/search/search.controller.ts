import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard, RequestUser } from 'src/auth/jwt-auth.guard';
import { User } from 'src/users/users.model';

@Controller('search')
export class SearchController {
    constructor(private searchService: SearchService) {}

    @ApiOperation({ summary: '' })
    @ApiResponse({ status: 200 })
    @UseGuards(JwtAuthGuard)
    @Get()
    search(@Req() request: RequestUser): any {
        return this.searchService.search(request);
    }
}
