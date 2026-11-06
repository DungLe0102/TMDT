import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { UsersModule } from '../users/users.module.js';
import { JwtStrategy } from './jwt/jwt.strategy.js';
import { JwtAuthGuard } from './jwt/jwt.guard.js';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
