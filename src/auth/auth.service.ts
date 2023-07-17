import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserLoginInput } from './user.login.type';
import { JwtPayload } from './jwt.payload';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    if (username === 'arya@gmail.com' && password === 'arya1234') {
      return;
    }
  }

  async login(
    userLoginInput: UserLoginInput,
  ): Promise<{ accessToken: string }> {
    const { password, username, role } = userLoginInput;
    if (
      username === 'arya@gmail.com' &&
      password === 'arya1234' &&
      role === 'user'
    ) {
      const payload: JwtPayload = { username, role };
      const secret = { secret: process.env.SECRET_KEY };
      return {
        accessToken: await this.jwtService.sign(payload, secret),
      };
    } else {
      throw new Error('Wrong Credentials');
    }
  }
}
