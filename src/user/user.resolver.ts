/* eslint-disable prettier/prettier */
import { Resolver, Query } from '@nestjs/graphql';
import { UserType } from './user.type';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role-decorator';
import { Role } from 'src/auth/role.enum';

@Resolver(() => UserType)
export class UserResolver {
  @Query(() => UserType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  getUser() {
    return {
      user_id: '1',
      user_name: 'Arya',
    };
  }
}
