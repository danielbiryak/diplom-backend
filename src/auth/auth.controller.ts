import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards
} from '@nestjs/common'
import { Request } from 'express'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/auth.dto'
import { Tokens } from './types/tokens.type'
import { LoginDto } from './dto/login.dto'
import { AuthGuard } from '@nestjs/passport'
import * as argon from 'argon2'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registration')
  registration(
    @Body() dto: RegisterDto
  ): Promise<Tokens> {
    return this.authService.registration(dto)
  }

  @Post('test')
  test(@Body('test') test: string) {
    return argon.hash(test).then((data) => {
      return { data }
    })
  }

  @Post('check-jwt')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  checkToken() {
    return
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<Tokens> {
    return this.authService.login(dto)
  }

  @Post('refresh-token')
  @UseGuards(AuthGuard('jwt-refresh'))
  refreshToken(@Req() req: Request) {
    const { user } = req
    const refresh_token =
      req.headers.authorization.split(' ')[1]

    return this.authService.refreshTokens(
      user['sub'],
      refresh_token
    )
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Req() req: Request) {
    const user = req.user

    return this.authService.logout(user['sub'])
  }
}
