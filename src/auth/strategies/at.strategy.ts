import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Injectable } from '@nestjs/common/decorators'
import { ConfigService } from '@nestjs/config'

type JwtPayload = {
  sub: string
  nick_name: string
}

@Injectable()
export class AtStrategy extends PassportStrategy(
  Strategy,
  'jwt'
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_AT_SECRET')
    })
  }

  validate(payload: JwtPayload) {
    return payload
  }
}
