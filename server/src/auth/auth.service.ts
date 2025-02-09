import { Schema } from 'mongoose';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from './refresh-token.service';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly userService: UsersService,
  ) {}

  async generateTokens(profile: User) {
    let user = await this.userService.findByEmail(profile.email);
    if (!user) {
      user = await this.userService.create({
        googleId: profile.googleId,
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar,
      });
    }

    const userId = user._id as Schema.Types.ObjectId;

    const payload = { sub: userId, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: process.env.ACCESS_TOKEN_LIFECYCLE });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: process.env.REFRESH_TOKEN_LIFECYCLE });

    await this.refreshTokenService.createRefreshToken(
      userId,
      refreshToken,
    );
    return { accessToken, refreshToken };
  }

  async refreshTokens(oldRefreshToken: string) {
    let payload;
    try {
      payload = this.jwtService.verify(oldRefreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const userId = payload.sub;
    const dbToken = await this.refreshTokenService.findValidRefreshToken(
      userId,
      oldRefreshToken,
    );
    if (!dbToken) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }
    // Delete the old refresh token.
    await this.refreshTokenService.deleteRefreshToken(dbToken._id as Schema.Types.ObjectId);

    const newPayload = { sub: userId, email: payload.email };
    const newAccessToken = this.jwtService.sign(newPayload, {
      expiresIn: process.env.ACCESS_TOKEN_LIFECYCLE,
    });
    const newRefreshToken = this.jwtService.sign(newPayload, {
      expiresIn: process.env.REFRESH_TOKEN_LIFECYCLE,
    });
    await this.refreshTokenService.createRefreshToken(
      userId,
      newRefreshToken,
    );
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
