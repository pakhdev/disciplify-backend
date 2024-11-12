import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginUserDto, CreateUserDto, UpdateUserDto, AuthErrorResponseDto } from './dto/';
import { User } from './entities/user.entity';
import { envConfig } from '../../config/env.config';

@Injectable()
export class AuthorizationService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    public async register(registerUserDto: CreateUserDto, res: Response): Promise<void | AuthErrorResponseDto> {
        const isNameTaken = await this.isNameRegistered(registerUserDto.name);
        if (isNameTaken.isRegistered) throw new BadRequestException({ errorCode: 'nameTaken' });
        return await this.create(registerUserDto, res);
    }

    async create(createUserDto: CreateUserDto, res: Response) {
        try {
            const { password, ...userData } = createUserDto;
            const user = this.userRepository.create({
                ...userData,
                password: bcrypt.hashSync(password, 10),
            });
            const savedUser = await this.userRepository.save(user);
            this.setAuthCookies(res, savedUser);
        } catch (error) {
            console.log('AuthorizationModule', error);
        }
    }

    async findById(id: number): Promise<User> {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async update(id: number, user: User, updateUserDto: UpdateUserDto): Promise<Object> {
        if (user.id !== id) throw new ForbiddenException();

        try {
            const { password } = updateUserDto;
            const user = await this.userRepository.preload({
                id,
                password: bcrypt.hashSync(password, 10),
            });

            if (!user) throw new NotFoundException('User not found');

            await this.userRepository.save(user);
            delete user.password;

            return {
                ...user,
                token: this.getJwtToken({ id: user.id }),
            };
        } catch (error) {
            console.log('AuthorizationModule', error);
        }
    }

    async login(loginUserDto: LoginUserDto) {
        const { password, name } = loginUserDto;
        const user = await this.userRepository.findOne({
            where: { name: name.toLowerCase().trim() },
            select: { id: true, name: true, password: true },
        });
        if (!user) {
            throw new UnauthorizedException('Credentials are not valid (email)');
        }
        if (!bcrypt.compareSync(password, user.password))
            throw new UnauthorizedException('Credentials are not valid (password)');

        delete user.password;
        return {
            ...user,
            token: this.getJwtToken({ id: user.id }),
        };
    }

    public async checkAuthStatus(user: User, res: Response): Promise<void> {
        this.setAuthCookies(res, user);
    }

    async findUsersWithOldStatisticDate(): Promise<User[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.userRepository.find({
            where: {
                statisticDate: LessThan(today),
            },
        });
    }

    async markStatisticDate(date: Date, user: User): Promise<void> {
        user.statisticDate = date;
        await this.userRepository.save(user);
    }

    async isNameRegistered(name: string): Promise<{ isRegistered: boolean }> {
        const findEmail = await this.userRepository.findOneBy({ name });
        return { isRegistered: !!findEmail };
    }

    private setAuthCookies(res: Response, user: User): void {
        const token = this.getJwtToken({ id: user.id });
        const expirationDate = new Date();
        expirationDate.setSeconds(expirationDate.getSeconds() + envConfig().jwtExpiresInSeconds);

        res.cookie('id', user.id.toString(), { expires: expirationDate });
        res.cookie('name', user.name, { expires: expirationDate });
        res.cookie('token', token, { httpOnly: true, expires: expirationDate });
        res.json({ message: 'Success' });
    }

    private getJwtToken(payload: JwtPayload) {
        return this.jwtService.sign(payload);
    }
}
