import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Patch,
    Query,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { AuthorizationService } from './authorization.service';
import { GetUser } from './decorators/get-user.decorator';
import { LoginUserDto, CreateUserDto, AuthErrorResponseDto, UpdatePasswordDto, CheckNameDto } from './dto/';
import { User } from './entities/user.entity';

@Controller('authorization')
export class AuthorizationController {
    constructor(private readonly authService: AuthorizationService) {}

    @Post('register')
    register(@Body() createUserDto: CreateUserDto, @Res() res: Response): Promise<void | AuthErrorResponseDto> {
        return this.authService.register(createUserDto, res);
    }

    @Post('login')
    login(@Body() loginUserDto: LoginUserDto, @Res() res: Response): Promise<void | AuthErrorResponseDto> {
        return this.authService.login(loginUserDto, res);
    }

    @Get('check-name')
    checkName(@Query() checkNameDto: CheckNameDto): Promise<{ isRegistered: boolean }> {
        return this.authService.isNameRegistered(checkNameDto.name);
    }

    @UseGuards(AuthGuard())
    @Patch('update-password')
    updatePassword(@GetUser() user: User, @Body() updatePasswordDto: UpdatePasswordDto, @Res() res: Response): Promise<void | AuthErrorResponseDto> {
        return this.authService.updatePassword(user, updatePasswordDto, res);
    }

    @Get('check-auth-status')
    @UseGuards(AuthGuard())
    checkAuthStatus(@GetUser() user: User, @Res() res: Response): Promise<void> {
        return this.authService.checkAuthStatus(user, res);
    }
}
