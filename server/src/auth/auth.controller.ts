import { Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { GoogleOauthGuard } from 'src/guards/google-oauth.guard';
import { AuthService } from './auth.service';
import { JwtGuard } from 'src/guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleCallback(@Req() req, @Res() res) {
    const user = req.user;
    const tokens = await this.authService.generateTokens(user);
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: false,
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
    });
    res.redirect(process.env.ORIGIN);
  }

  @Get('profile')
  @UseGuards(JwtGuard)
  profile(@Req() req) {
    return req.user;
  }


  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req, @Res() res) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const tokens = await this.authService.refreshTokens(refreshToken);
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: false,
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
    });
    return res.json(tokens);
  }
}
