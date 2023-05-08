import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RequestUser } from 'src/auth/jwt-auth.guard';
import { User } from 'src/users/users.model';
import { UsersService } from 'src/users/users.service';

type SearchSection =
    | 'all'
    | 'users'
    | 'posts'
    | 'communities'
    | 'musics'
    | 'videos';

@Injectable()
export class SearchService {
    constructor(private userService: UsersService) {}

    async search(req: RequestUser) {
        const { q, section } = req.query;
        if (typeof q !== 'string' || typeof section !== 'string') {
            return 'error';
        }
        const users = await this.userService.searchUsers(q);
        const posts = await this.searchPosts(q);
        const communities = await this.searchCommunities(q);
        const musics = await this.searchMusics(q);
        const videos = await this.searchVideos(q);
        const response = {
            data: {
                users: [],
                posts: [],
                communities: [],
                musics: [],
                videos: [],
            },
            counts: {
                users: users.count,
                posts: posts.count,
                communities: communities.count,
                musics: musics.count,
                videos: videos.count,
            },
        };
        if (section === 'all') {
            response.data.users = users.data.slice(0, 3);
            response.data.posts = posts.data.slice(0, 3);
            response.data.communities = communities.data.slice(0, 3);
            response.data.musics = musics.data.slice(0, 3);
            response.data.videos = videos.data.slice(0, 3);
        } else {
            switch (section) {
                case 'users':
                    response.data.users = users.data;
                    break;
                case 'posts':
                    response.data.posts = posts.data;
                    break;
                case 'communities':
                    response.data.communities = communities.data;
                    break;
                case 'musics':
                    response.data.musics = musics.data;
                    break;
                case 'videos':
                    response.data.videos = videos.data;
                    break;
                default:
                    return 'error';
            }
        }
        return response;
    }

    async searchPosts(q: string) {
        return { data: [], count: 0 };
    }

    async searchCommunities(q: string) {
        return { data: [], count: 0 };
    }

    async searchMusics(q: string) {
        return { data: [], count: 0 };
    }

    async searchVideos(q: string) {
        return { data: [], count: 0 };
    }
}
