import {
  Controller,
  Post,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @Post('supporter/login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.loginWithEmail(req.user);

    res.cookie('access_token', token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      secure: true,
      sameSite: 'strict',
      maxAge: 3600000 * 24,
    });

    return { success: true, message: 'با موفقیت وارد شدید' };
  }

  // @Post('login')
  // async login(@Body() loginDto: LoginDto) {

  //   const user = await this.authService.validateUser(loginDto.phone);
  //   return this.authService.login(user);
  // }
}
