import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserProfileService } from '../user/user-profile.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; token: string }> {
    this.logger.log(`User registration attempt for email: ${registerDto.email}`, {
      context: 'AuthService.register',
      email: registerDto.email,
      role: registerDto.role,
    });

    try {
      const user = await this.userService.create(registerDto);
      
      // Automatically create profile based on role
      await this.userProfileService.ensureProfileExists(user.id, user.role);
      
      const token = this.generateToken(user);
      
      this.logger.log(`User registration successful`, {
        context: 'AuthService.register',
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return { user, token };
    } catch (error) {
      this.logger.error(`User registration failed`, {
        context: 'AuthService.register',
        email: registerDto.email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    this.logger.log(`User login attempt for email: ${loginDto.email}`, {
      context: 'AuthService.login',
      email: loginDto.email,
    });

    try {
      const user = await this.userService.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        this.logger.warn(`Login failed - invalid credentials`, {
          context: 'AuthService.login',
          email: loginDto.email,
        });
        throw new UnauthorizedException('Invalid credentials');
      }
      
      const token = this.generateToken(user);
      
      this.logger.log(`User login successful`, {
        context: 'AuthService.login',
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return { user, token };
    } catch (error) {
      this.logger.error(`User login failed`, {
        context: 'AuthService.login',
        email: loginDto.email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  private generateToken(user: User): string {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role 
    };
    return this.jwtService.sign(payload);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    return this.userService.validateUser(email, password);
  }
}
