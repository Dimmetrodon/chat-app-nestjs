import { UpdateProfileInfoDto } from './dto/update-profile-info.dto';
import { Inject, Injectable } from '@nestjs/common';
import { Avatar, User } from './users.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import { RequestUser } from 'src/auth/jwt-auth.guard';
import { FriendsService } from 'src/friends/friends.service';
import { forwardRef } from '@nestjs/common/utils';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User) private userRepository: typeof User,
        @Inject(forwardRef(() => FriendsService))
        private friendService: FriendsService
    ) {}

    async createUser(dto: CreateUserDto) {
        const colors: Avatar[] = [
            'green',
            'teal',
            'blue',
            'indigo',
            'purple',
            'pink',
            'red',
            'orange',
            'yellow',
        ];
        const avatar: Avatar = colors[Math.floor(Math.random() * 9)];
        const lastSeen = String(Date.now());
        const user = await this.userRepository.create({
            ...dto,
            avatar,
            lastSeen,
        });
        const userWithOnlineInfo = await this.userRepository.findOne({
            where: { id: user.id },
        });
        return userWithOnlineInfo;
    }

    async getAllUsers() {
        const users = await this.userRepository.findAll();

        users.map((user) => {
            // @ts-ignore
            delete user.dataValues.password;
        });

        return users;
    }

    async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({
            where: { email },
        });

        return user;
    }
    async getUserById(id: number, request?: RequestUser) {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (request) {
            const { id: userId } = request.user;
            await this.updateLastSeen(userId);
            if (id != userId) {
                const status = await this.friendService.getFriendStatus(
                    userId,
                    id
                );
                // @ts-ignore
                user.dataValues.friendStatus = status;
            }
        }

        // @ts-ignore
        delete user.dataValues.password;

        return user;
    }

    async updateProfileInfo(request: RequestUser, data: UpdateProfileInfoDto) {
        const { id } = request.user;
        await this.updateLastSeen(id);
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (user) {
            user.firstName = data.firstName;
            user.lastName = data.lastName;
            user.save();
        }

        // @ts-ignore
        delete user.dataValues.password;

        return user;
    }

    async getUsersByIds(ids: number[]) {
        const friends = await this.userRepository.findAll({
            where: { id: [...ids] },
        });

        return friends;
    }

    async updateLastSeen(id: number) {
        const lastSeen = String(Date.now());
        const user = await this.userRepository.update(
            { lastSeen },
            { where: { id } }
        );

        return user;
    }

    async searchUsers(q: string) {
        const users = await this.userRepository.findAll();
        const clearUsers = users.filter(({ firstName, lastName }) => {
            const fullName = `${firstName.toLowerCase()} ${lastName.toLowerCase()}`;
            const fullNameReverse = `${lastName.toLowerCase()} ${firstName.toLowerCase()}`;
            return (
                fullName.includes(String(q).toLowerCase()) ||
                fullNameReverse.includes(String(q).toLowerCase())
            );
        });
        users.forEach((user) => {
            // @ts-ignore
            delete user.dataValues.password;
            return user;
        });
        return { data: clearUsers, count: clearUsers.length };
    }
}
