import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users.model';
import { AuthModule } from '../auth/auth.module';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [
        SequelizeModule.forFeature([User]),
        forwardRef(() => AuthModule),
        forwardRef(() => FriendsModule),
    ],
    exports: [UsersService],
})
export class UsersModule {}
