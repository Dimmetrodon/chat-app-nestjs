import { Module, forwardRef } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    controllers: [SearchController],
    imports: [
        forwardRef(() => UsersModule),
        JwtModule.register({
            secret: process.env.PRIVATE_KEY || 'SECRET',
            signOptions: {
                expiresIn: '24h',
            },
        }),
    ],
    providers: [SearchService],
    exports: [SearchService],
})
export class SearchModule {}
