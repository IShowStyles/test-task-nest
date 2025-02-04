// @ts-check
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { User } from '../users/users.model';
import { CreateUserDto } from '../users/dto/create-users.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: CreateUserDto) {
    const user = await this.usersService.createUser(dto);
    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async login(dto: LoginUserDto) {
    const user = await this.validateUser(dto);
    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async refreshToken(refreshToken: string) {
    try {
      const userData = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.usersService.getUserByEmail(userData.email);
      const tokens = await this.generateTokens(user);
      return { user, ...tokens };
    } catch (error) {
      throw new UnauthorizedException('invalid refresh token');
    }
  }

  async generateTokens(user: User) {
    const payload = { email: user.email, id: user.id };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '30m', // пример: 30 минут
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '30d', // пример: 30 дней
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('refreshToken needed');
    }

    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
    const user = await this.usersService.getUserByEmail(payload.email);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException(
        'Пользователь не найден или уже не авторизован',
      );
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Невалидный refresh токен');
    }

    await this.updateRefreshTokenInDB(user.id, null);

    return { message: 'Logout successful' };
  }

  private async updateRefreshTokenInDB(
    userId: number,
    refreshToken: string | null,
  ) {
    const user = await this.usersService.getUserById(userId);
    user.refreshToken = refreshToken;
    await user.save();
  }

  private async validateUser(dto: LoginUserDto) {
    const user = await this.usersService.getUserByEmail(dto.email);
    if (!user) {
      throw new HttpException(
        'Пользователь не найден',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const passwordEquals = await bcrypt.compare(dto.password, user.password);
    if (user && passwordEquals) {
      return user;
    }
    throw new UnauthorizedException('Некорректный email или пароль');
  }

  private sanitizeUser(user: User) {
    const { password, refreshToken, ...rest } = user.get({ plain: true });
    return rest; // вернёт объект без password и refreshToken
  }
}
