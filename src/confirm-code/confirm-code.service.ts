import { UsersService } from './../users/users.service';
import { EmailService } from './../email/email.service';
import { v4 as uuidv4 } from 'uuid';
import { ConfirmCodeDto } from './dto/confirm-code.dto';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfirmCode } from './confirm-code.model';
import { User } from 'src/users/users.model';
import { CreateConfirmCodeDto } from './dto/create-confirm-code.dto';

@Injectable()
export class ConfirmCodeService {
    constructor(
        @InjectModel(ConfirmCode)
        private confirmCodeRepository: typeof ConfirmCode,
        private emailService: EmailService,
        private userService: UsersService
    ) {}

    async generateCode(dto: CreateConfirmCodeDto) {
        const { email } = dto;
        const confirmCode = uuidv4().slice(0, 6);
        const candidate = await this.userService.getUserByEmail(email);
        if (candidate) {
            throw new HttpException(
                'Пользователь с таким email существует',
                HttpStatus.BAD_REQUEST
            );
        }

        const alreadyCreated = await this.getConfirmCodeByEmail(email);
        if (alreadyCreated) {
            alreadyCreated.confirmCode = confirmCode;
            alreadyCreated.confirmed = false;
            alreadyCreated.save();
        } else {
            await this.confirmCodeRepository.create({ email, confirmCode });
        }
        await this.emailService.sendUserConfirmation(email, confirmCode);
        return { email };
    }

    async confirmCode(dto: ConfirmCodeDto) {
        const { email, confirmCode } = dto;
        const candidateEmail = await this.userService.getUserByEmail(email);
        if (candidateEmail) {
            throw new HttpException(
                'Пользователь с таким email существует',
                HttpStatus.BAD_REQUEST
            );
        }

        const candidate = await this.getConfirmCode(email, confirmCode);
        if (candidate) {
            candidate.confirmed = true;
            candidate.save();
        }

        if (!candidate) {
            throw new HttpException(
                'Неверный код подтверждения',
                HttpStatus.BAD_REQUEST
            );
        }

        return { isConfirmed: true };
    }

    async getConfirmCode(email: string, confirmCode: string) {
        const candidate = await this.confirmCodeRepository.findOne({
            where: { email, confirmCode },
        });

        return candidate;
    }

    async getConfirmCodeByEmail(email: string) {
        const confirmCode = await this.confirmCodeRepository.findOne({
            where: { email },
        });

        return confirmCode;
    }

    async removeConfirmCode(email: string) {
        await this.confirmCodeRepository.destroy({ where: { email } });

        return true;
    }
}
