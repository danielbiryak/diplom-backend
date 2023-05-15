import {
  ForbiddenException,
  Injectable
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as argon from 'argon2'

import { PrismaService } from 'src/prisma/prisma.service'
import { RegisterDto } from './dto/auth.dto'
import { Tokens } from './types/tokens.type'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async registration(
    dto: RegisterDto
  ): Promise<Tokens> {
    const hash = await this.hashData(dto.password)

    const newUser = await this.prisma.user.create({
      data: {
        nick_name: dto.nick_name,
        real_name: dto.real_name,
        hash_pass: hash,
        birthday_date: dto.birthday_date
      }
    })

    const tokens = await this.getTokens(
      newUser.id,
      newUser.nick_name
    )
    await this.updateRtHash(
      newUser.id,
      tokens.refresh_token
    )

    return tokens
  }

  async login(dto: LoginDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        nick_name: dto.nick_name
      }
    })

    if (!user)
      throw new ForbiddenException('Access Denied')

    const passwordMatches = await argon.verify(
      user.hash_pass,
      dto.password
    )

    if (!passwordMatches)
      throw new ForbiddenException('Access Denied')

    const tokens = await this.getTokens(
      user.id,
      user.nick_name
    )

    await this.updateRtHash(
      user.id,
      tokens.refresh_token
    )

    return tokens
  }

  async logout(userId: string) {
    const user = await this.prisma.user.update({
      data: {
        hash_rt: null
      },
      where: {
        id: userId
      }
    })

    return { data: user }
  }

  private async getTokens(
    userId: string,
    nick_name: string
  ): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          nick_name
        },
        {
          expiresIn: process.env.JWT_AT_EXPIRES_IN,
          secret: process.env.JWT_AT_SECRET
        }
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          nick_name
        },
        {
          expiresIn: process.env.JWT_RT_EXPIRES_IN,
          secret: process.env.JWT_RT_SECRET
        }
      )
    ])

    return {
      access_token: at,
      refresh_token: rt
    }
  }

  async refreshTokens(
    user_id: string,
    refresh_token: string
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: user_id
      }
    })
    if (!user)
      throw new ForbiddenException('Access Denied')

    const rtMatch = await argon.verify(
      user.hash_rt,
      refresh_token
    )
    if (!rtMatch)
      throw new ForbiddenException('Access Denied')

    const tokens = await this.getTokens(
      user.id,
      user.nick_name
    )
    await this.updateRtHash(
      user.id,
      tokens.refresh_token
    )

    return tokens
  }

  private async updateRtHash(
    userId: string,
    rt: string
  ) {
    const hash = await this.hashData(rt)

    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        hash_rt: hash
      }
    })
  }

  private async hashData(data: string) {
    return await argon.hash(data)
  }
}
