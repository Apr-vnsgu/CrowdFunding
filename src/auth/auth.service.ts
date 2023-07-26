import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserLoginInput } from './user.login.type';
import { JwtPayload } from './jwt.payload';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.getUser(username, password);
    if (user) {
      if (user.password === password) {
        const { password, ...result } = user;
        password.length;
        return result;
      }
    } else {
      return null;
    }
  }

  async login(
    userLoginInput: UserLoginInput,
  ): Promise<{ accessToken: string }> {
    const { password, username } = userLoginInput;
    const user = await this.userService.getUser(username, password);
    if (user) {
      const payload: JwtPayload = { username };
      const secret = { secret: process.env.SECRET_KEY };
      return {
        accessToken: await this.jwtService.sign(payload, secret),
      };
    } else {
      throw new Error('Wrong Credentials');
    }
  }
}
