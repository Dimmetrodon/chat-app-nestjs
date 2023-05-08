import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/users.model';
import { AuthModule } from './auth/auth.module';
import { ConfirmCodeModule } from './confirm-code/confirm-code.module';
import { EmailModule } from './email/email.module';
import { FriendsModule } from './friends/friends.module';
import { ConfirmCode } from './confirm-code/confirm-code.model';
import { Friend } from './friends/friends.model';
import { MessagesModule } from './messages/messages.module';
import { ChatsModule } from './chats/chats.module';
import { SearchModule } from './search/search.module';

@Module({
    providers: [],
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.${process.env.NODE_ENV}.env`,
        }),
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRESS_PORT),
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRESS_PASSWORD,
            database: process.env.POSTGRES_DB,
            models: [User, ConfirmCode, Friend],
            autoLoadModels: true,
        }),
        UsersModule,
        AuthModule,
        ConfirmCodeModule,
        EmailModule,
        FriendsModule,
        MessagesModule,
        ChatsModule,
        SearchModule,
    ],
})
export class AppModule {}
