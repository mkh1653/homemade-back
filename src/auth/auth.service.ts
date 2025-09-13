import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { UserRole } from 'src/common/enums/role.enum';
import { AuthUserPayload } from 'src/common/interfaces/auth-user-payload.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUserByEmail(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);

    if (user && user.userPassword) {
      const isMatch = await this.userService.comparePassword(
        pass,
        user.userPassword.hash,
      );
      if (isMatch) {
        const { userPassword, ...result } = user;
        return result;
      }
    }
    throw new UnauthorizedException('Invalid credentials.');
  }

  async loginWithEmail(user: any) {
    const payload = {
      userId: user.id,
      userPublicId: user.publicId,
      personPublicId: user.person.publicId,
      role: UserRole.SUPPORT,
    };

    return this.jwtService.sign(payload);
  }

  // async login(user: User) {
  //   let role: UserRole;

  //   if (user.person.customers && user.person.customers.length > 0) {
  //     role = UserRole.CUSTOMER;
  //   } else if (user.person.providers && user.person.providers.length > 0) {
  //     role = UserRole.PROVIDER;
  //   } else if (user.person.supporters && user.person.supporters.length > 0) {
  //     role = UserRole.SUPPORT;
  //   } else {
  //     throw new BadRequestException('Invalid role specified for login.');
  //   }

  //   const payload: AuthUserPayload = {
  //     userId: user.id,
  //     userPublicId: user.publicId,
  //     personPublicId: user.person.publicId,
  //     customerPublicId:
  //       role === UserRole.CUSTOMER
  //         ? user.person.customers[0].publicId
  //         : undefined,
  //     providerPublicId:
  //       role === UserRole.PROVIDER
  //         ? user.person.providers[0].publicId
  //         : undefined,
  //     role: role,
  //     iat: undefined,
  //     exp: undefined,
  //   };

  //   switch (role) {
  //     case UserRole.CUSTOMER:
  //       const customer = user.person.customers?.find((c) => true);
  //       if (!customer) {
  //         throw new BadRequestException(
  //           'Customer profile not found for this user.',
  //         );
  //       }
  //       payload.customerPublicId = customer.publicId;
  //       break;
  //     case UserRole.PROVIDER:
  //       const provider = user.person.providers?.find((p) => true);
  //       if (!provider) {
  //         throw new BadRequestException(
  //           'Provider profile not found for this user.',
  //         );
  //       }
  //       payload.providerPublicId = provider.publicId;
  //       break;
  //     case UserRole.SUPPORT:
  //       break;
  //     default:
  //       throw new BadRequestException('Invalid role specified for login.');
  //   }

  //   return {
  //     accessToken: this.jwtService.sign(payload),
  //   };
  // }
}
