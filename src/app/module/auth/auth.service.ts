import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import sendMailer from 'src/app/helper/sendMailer';
import * as bcrypt from 'bcrypt';
import config from 'src/app/config';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) throw new BadRequestException('User already exists');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await this.prisma.user.create({
      data: {
        email,
        otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendMailer({
      to: email,
      subject: 'Verify your email',
      html: `<h2>Your OTP is: ${otp}</h2>`,
    });

    return result;
  }

  async signupVerify({ email, otp }: { email: string; otp: string }) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new BadRequestException('User not found');
    if (user.isVerified) throw new BadRequestException('Already verified');
    if (user.otp !== otp) throw new BadRequestException('Invalid OTP');
    if (user.otpExpiry! < new Date())
      throw new BadRequestException('OTP expired');

    return this.prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null,
      },
    });
  }

  async updateSignup(payload: Partial<CreateAuthDto>) {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) throw new BadRequestException('User not found');

    if (!user.isVerified) throw new BadRequestException('User not verified');

    if (payload.password) {
      payload.password = await bcrypt.hash(
        payload.password,
        Number(config.bcryptSaltRounds),
      );
    }

    const result = await this.prisma.user.update({
      where: { email: payload.email },
      data: {
        ...payload,
        isVerified: true,
        otp: null,
        otpExpiry: null,
      },
    });

    return result;
  }

  async login(loginDto: LoginAuthDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) throw new BadRequestException('User not found');
    if (!user.isVerified)
      throw new BadRequestException('Please verify your email first');

    const match = await bcrypt.compare(loginDto.password, user.password || '');

    if (!match) throw new BadRequestException('Incorrect password');

    const payload = { id: user.id, email: user.email, role: user.role };

    const accessToken = this.jwt.sign(payload, {
      secret: config.jwt.accessTokenSecret,
      expiresIn: '15m',
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: config.jwt.refreshTokenSecret,
      expiresIn: '7d',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { accessToken, user };
  }

  refreshToken(res: Response) {
    const token = res.req.cookies?.refreshToken as string | undefined;
    if (!token) throw new BadRequestException('No refresh token');

    const safeToken: string = token;

    let decoded;
    try {
      decoded = this.jwt.verify(token, {
        secret: config.jwt.refreshTokenSecret,
      });
    } catch {
      throw new BadRequestException('Invalid refresh token');
    }

    const payload = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    const accessToken = this.jwt.sign(payload, {
      secret: config.jwt.accessTokenSecret,
      expiresIn: '15m',
    });

    return { accessToken };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new HttpException('Email not found', 404);

    const generateOtpNumber = Math.floor(100000 + Math.random() * 900000);

    await this.prisma.user.update({
      where: { email },
      data: {
        otp: generateOtpNumber.toString(),
        otpExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const html = `
    <div style="font-family: Arial; text-align: center;">
      <h2 style="color:#4f46e5;">Password Reset OTP</h2>
      <p>Your OTP code is:</p>
      <h1 style="letter-spacing:4px;">${generateOtpNumber}</h1>
      <p>This code will expire in 1 hour.</p>
    </div>
  `;

    await sendMailer({
      to: user.email,
      subject: 'Reset Password OTP',
      html: html,
    });

    return { message: 'Check your email for OTP' };
  }

  async verifyEmail(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpException('Invalid link', 400);

    if (user.otp !== otp) throw new HttpException('Invalid OTP', 400);
    if (!user.otpExpiry) throw new HttpException('Invalid OTP', 400);
    const todayDate = new Date();
    if (user.otpExpiry < todayDate) throw new HttpException('OTP expired', 400);

    await this.prisma.user.update({
      where: { email },
      data: {
        otp: null,
        otpExpiry: null,
        verifiedForget: true,
      },
    });

    return { message: 'OTP verified successfully' };
  }

  async resetPasswordChange(email: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpException('Invalid link', 400);

    if (!user.verifiedForget) throw new HttpException('Invalid link', 400);

    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(config.bcryptSaltRounds),
    );

    await this.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        verifiedForget: false,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', 404);
    if (!user.password)
      throw new HttpException('User has no password set', 400);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new HttpException('Invalid old password', 400);

    if (oldPassword === newPassword)
      throw new HttpException(
        'New password cannot be same as old password',
        400,
      );

    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(config.bcryptSaltRounds),
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }
}
