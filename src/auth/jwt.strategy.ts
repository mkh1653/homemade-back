import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthUserPayload } from 'src/common/interfaces/auth-user-payload.interface';
import { UserRole } from 'src/common/enums/role.enum';

const cookieExtractor = (req: Request) => {
  let token = null;

  if (req.headers.authorization) {
    const [type, tokenFromHeader] = req.headers.authorization.split(' ');
    if (type === 'Bearer' && tokenFromHeader) {
      token = tokenFromHeader;
    }
  }
  if (!token && req.cookies) {
    token = req.cookies['access_token'];
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: AuthUserPayload): Promise<AuthUserPayload> {
    if (!payload.personPublicId || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return payload;
  }
}
