import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Patch,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { AuthorizationService } from './authorization.service';
import { GetUser } from './decorators/get-user.decorator';
import { LoginUserDto, CreateUserDto, AuthErrorResponseDto, UpdatePasswordDto } from './dto/';
import { User } from './entities/user.entity';

@Controller('authorization')
export class AuthorizationController {
    constructor(private readonly authService: AuthorizationService) {}

    @Post('register')
    register(@Body() createUserDto: CreateUserDto, @Res() res: Response): Promise<void | AuthErrorResponseDto> {
        return this.authService.register(createUserDto, res);
    }

    @Post('login')
    loginUser(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @UseGuards(AuthGuard())
    @Patch('update-password')
    updatePassword(@GetUser() user: User, @Body() updatePasswordDto: UpdatePasswordDto, @Res() res: Response): Promise<void | AuthErrorResponseDto> {
        return this.authService.updatePassword(user, updatePasswordDto, res);
    }

    @Get('check-auth-status')
    @UseGuards(AuthGuard())
    checkAuthStatus(@GetUser() user: User, @Res() res: Response) {
        return this.authService.checkAuthStatus(user, res);
    }
}
