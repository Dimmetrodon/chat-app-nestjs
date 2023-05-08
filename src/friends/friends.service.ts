import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Friend } from './friends.model';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/users.model';
import { RequestUser } from 'src/auth/jwt-auth.guard';
import { forwardRef } from '@nestjs/common/utils';

export type FriendStatus =
    | 'possibleFriend'
    | 'outcomingRequest'
    | 'incomingRequest'
    | 'alreadyFriend';

@Injectable()
export class FriendsService {
    constructor(
        @InjectModel(Friend) private friendRepository: typeof Friend,
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService
    ) {}

    async getAllFriends(id: number, request: RequestUser) {
        const { id: userId } = request.user;
        await this.usersService.updateLastSeen(userId);
        let query: { [key: string]: boolean } = {};
        const ids = [];
        const { status, q, section } = request.query;
        switch (status) {
            case 'outcomingRequest':
                query = { isRequested: true, isAccepted: false };
                break;
            case 'incomingRequest':
                query = { isRequested: false, isAccepted: true };

                break;
            case 'alreadyFriend':
                query = { isRequested: true, isAccepted: true };

                break;
            default:
                throw new HttpException(
                    'Invalid status',
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
        }
        const friendsFrom = await this.friendRepository.findAll({
            where: { from: id, ...query },
        });
        const friendsTo = await this.friendRepository.findAll({
            where: {
                to: id,
                isRequested: query.isAccepted,
                isAccepted: query.isRequested,
            },
        });
        friendsFrom &&
            friendsFrom.map((friend) => {
                ids.push(friend.to);
                return friend;
            });
        friendsTo &&
            friendsTo.map((friend) => {
                ids.push(friend.from);
                return friend;
            });
        if (ids) {
            let clearFriends = await this.usersService.getUsersByIds(ids);
            // TODO в дальнейшем прикрутить пагинацию
            const friendsToArray = await this.friendRepository.findAll({
                where: {
                    to: id,
                    isRequested: true,
                    isAccepted: true,
                },
                include: [
                    {
                        model: User,
                        as: 'fromUser',
                    },
                ],
            });
            const friendsFromArray = await this.friendRepository.findAll({
                where: {
                    from: id,
                    isRequested: true,
                    isAccepted: true,
                },
                include: [
                    {
                        model: User,
                        as: 'toUser',
                    },
                ],
            });
            const incomingRequestsArray = await this.friendRepository.findAll({
                where: {
                    to: id,
                    isRequested: true,
                    isAccepted: false,
                },
            });
            const outcomingRequestsArray = await this.friendRepository.findAll({
                where: {
                    from: id,
                    isRequested: true,
                    isAccepted: false,
                },
            });
            if (q) {
                clearFriends = clearFriends.filter(
                    ({ firstName, lastName }) => {
                        const fullName = `${firstName.toLowerCase()} ${lastName.toLowerCase()}`;
                        const fullNameReverse = `${lastName.toLowerCase()} ${firstName.toLowerCase()}`;
                        return (
                            fullName.includes(String(q).toLowerCase()) ||
                            fullNameReverse.includes(String(q).toLowerCase())
                        );
                    }
                );
            }
            if (section === 'online') {
                clearFriends = clearFriends.filter(({ lastSeen }) => {
                    return Date.now() - +lastSeen < 300000;
                });
            }
            const user = await this.usersService.getUserById(id);
            return {
                counts: {
                    friends: friendsFromArray.length + friendsToArray.length,
                    onlineFriends: [
                        ...friendsFromArray.filter(
                            ({ toUser }) =>
                                Date.now() - +toUser.lastSeen < 300000
                        ),
                        ...friendsToArray.filter(
                            ({ fromUser }) =>
                                Date.now() - +fromUser.lastSeen < 300000
                        ),
                    ].length,
                    incomingRequests: incomingRequestsArray.length,
                    outcomingRequests: outcomingRequestsArray.length,
                },
                friends: clearFriends
                    .sort(
                        (
                            { firstName: firstNameA }: User,
                            { firstName: firstNameB }: User
                        ) => {
                            if (firstNameA < firstNameB) {
                                return -1;
                            }
                            if (firstNameA > firstNameB) {
                                return 1;
                            }
                            return 0;
                        }
                    )
                    .map((friend) => {
                        // @ts-ignore
                        friend.dataValues.friendStatus = status;
                        return friend;
                    }),
                profile: user,
            };
        }
        return [];
    }

    async updateFriendStatus(userId: number, id: number) {
        await this.usersService.updateLastSeen(userId);
        if (userId == id) {
            throw new HttpException(
                'Requesting user and accepting user are the same person',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        const candidate = await this.friendRepository.findOne({
            where: {
                from: [userId, id],
                to: [userId, id],
            },
        });
        if (!candidate) {
            await this.friendRepository.create({ from: userId, to: id });
            return { id, friendStatus: 'outcomingRequest' };
        }
        if (candidate.from === userId) {
            candidate.isRequested = !candidate.isRequested;
            candidate.save();
            if (candidate.isRequested && candidate.isAccepted) {
                return { id: candidate.to, friendStatus: 'alreadyFriend' };
            }
            if (candidate.isRequested && !candidate.isAccepted) {
                return { id: candidate.to, friendStatus: 'outcomingRequest' };
            }
            if (!candidate.isRequested && candidate.isAccepted) {
                return { id: candidate.to, friendStatus: 'incomingRequest' };
            }
            if (!candidate.isRequested && !candidate.isAccepted) {
                return { id: candidate.to, friendStatus: 'possibleFriend' };
            }
        } else if (candidate.to === userId) {
            candidate.isAccepted = !candidate.isAccepted;
            candidate.save();
            if (candidate.isRequested && candidate.isAccepted) {
                return { id: candidate.from, friendStatus: 'alreadyFriend' };
            }
            if (candidate.isRequested && !candidate.isAccepted) {
                return { id: candidate.from, friendStatus: 'incomingRequest' };
            }
            if (!candidate.isRequested && candidate.isAccepted) {
                return { id: candidate.from, friendStatus: 'outcomingRequest' };
            }
            if (!candidate.isRequested && !candidate.isAccepted) {
                return { id: candidate.from, friendStatus: 'possibleFriend' };
            }
        }
    }

    async getFriendStatus(userId: number, id: number) {
        const candidateFrom = await this.friendRepository.findOne({
            where: { from: userId, to: id },
        });
        if (candidateFrom) {
            if (candidateFrom.isRequested && candidateFrom.isAccepted) {
                return 'alreadyFriend';
            } else if (candidateFrom.isRequested && !candidateFrom.isAccepted) {
                return 'outcomingRequest';
            } else if (!candidateFrom.isRequested && candidateFrom.isAccepted) {
                return 'incomingRequest';
            }
        }
        const candidateTo = await this.friendRepository.findOne({
            where: { to: userId, from: id },
        });
        if (candidateTo) {
            if (candidateTo.isRequested && candidateTo.isAccepted) {
                return 'alreadyFriend';
            } else if (candidateTo.isRequested && !candidateTo.isAccepted) {
                return 'incomingRequest';
            } else if (!candidateTo.isRequested && candidateTo.isAccepted) {
                return 'outcomingRequest';
            }
        }

        return 'possibleFriend';
    }
}
