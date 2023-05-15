import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Injectable } from '@nestjs/common/decorators'
import { ConfigService } from '@nestjs/config'

type JwtPayload = {
  sub: string
  nick_name: string
}

@Injectable()
export class RtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh'
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_RT_SECRET')
    })
  }

  validate(payload: JwtPayload) {
    return payload
  }
}
