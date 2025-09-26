import { Injectable, Logger, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    this.logger.log(`JWT authentication attempt`, {
      context: 'JwtAuthGuard.canActivate',
      url: request.url,
      method: request.method,
      hasToken: !!token,
    });

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.warn(`JWT authentication failed`, {
        context: 'JwtAuthGuard.handleRequest',
        error: err?.message,
        info: info?.message,
      });
      throw err || new Error('Unauthorized');
    }

    this.logger.log(`JWT authentication successful`, {
      context: 'JwtAuthGuard.handleRequest',
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return user;
  }
}
