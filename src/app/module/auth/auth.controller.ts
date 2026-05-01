import {
  Controller,
  Post,
  Body,
  Patch,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateAuthDto,
  LoginAuthDto,
  ForgotPasswordDto,
  VerifyEmailDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/create-auth.dto';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'User Signup (Send OTP)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
      required: ['email'],
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body('email') email: string) {
    const result = await this.authService.signup(email);

    return {
      message: 'OTP sent to your email',
      data: result.email,
    };
  }

  @Post('signup-verify')
  @ApiOperation({ summary: 'Verify Signup OTP' })
  @ApiBody({ type: VerifyEmailDto })
  @HttpCode(HttpStatus.OK)
  async signupVerify(@Body() payload: { email: string; otp: string }) {
    const result = await this.authService.signupVerify(payload);

    return {
      message: 'User verified successfully',
      data: result.email,
    };
  }

  @Patch('update-signup')
  @ApiOperation({ summary: 'Complete Signup (set password & info)' })
  @ApiBody({ type: CreateAuthDto })
  @HttpCode(HttpStatus.OK)
  async updateSignup(@Body() payload: CreateAuthDto) {
    const result = await this.authService.updateSignup(payload);

    return {
      message: 'User updated successfully',
      data: result,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiBody({ type: LoginAuthDto })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.login(loginDto, res);

    return {
      message: 'Login successful',
      data,
    };
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh Access Token' })
  @HttpCode(HttpStatus.OK)
  refreshToken(@Res({ passthrough: true }) res: Response) {
    const data = this.authService.refreshToken(res);

    return {
      message: 'Token refreshed',
      data,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'User Logout' })
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');
    return { message: 'Logout successful' };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send OTP for Password Reset' })
  @ApiBody({ type: ForgotPasswordDto })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto.email);

    return {
      message: 'OTP sent to email',
      data: result,
    };
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify OTP for Password Reset' })
  @ApiBody({ type: VerifyEmailDto })
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    const result = await this.authService.verifyEmail(dto.email, dto.otp);

    return {
      message: 'OTP verified',
      data: result,
    };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset Password' })
  @ApiBody({ type: ResetPasswordDto })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.authService.resetPasswordChange(
      dto.email,
      dto.newPassword,
    );

    return {
      message: 'Password reset successful',
      data: result,
    };
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change Password (Logged in user)' })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: ChangePasswordDto })
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() dto: ChangePasswordDto) {
    const userId = 'USER_ID_FROM_TOKEN';

    const result = await this.authService.changePassword(
      userId,
      dto.oldPassword,
      dto.newPassword,
    );

    return {
      message: 'Password changed successfully',
      data: result,
    };
  }
}
