import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Patch,
    Param,
    ParseUUIDPipe,
    ParseIntPipe, Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { AuthorizationService } from './authorization.service';
import { GetUser } from './decorators/get-user.decorator';
import { LoginUserDto, CreateUserDto, UpdateUserDto, AuthErrorResponseDto } from './dto/';
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
    @Patch('update/:id')
    updateUser(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.authService.update(id, user, updateUserDto);
    }

    @Get('check-auth-status')
    @UseGuards(AuthGuard())
    checkAuthStatus(@GetUser() user: User, @Res() res: Response) {
        return this.authService.checkAuthStatus(user, res);
    }
}
