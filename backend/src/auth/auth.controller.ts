import { Controller, Post, Body, Get, UseGuards, Request, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../user/user.entity';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: { user: User }) {
    this.logger.log(`Profile access`, {
      context: 'AuthController.getProfile',
      userId: req.user.id,
      email: req.user.email,
    });
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req: { user: User }) {
    this.logger.log(`User logout`, {
      context: 'AuthController.logout',
      userId: req.user.id,
      email: req.user.email,
    });
    return { message: 'Logged out successfully' };
  }
}
