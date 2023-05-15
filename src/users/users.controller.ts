import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { UsersService } from './users.service'
import { Request } from 'express'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/:nickname')
  @UseGuards(AuthGuard('jwt'))
  findUsersByNickname(
    @Param('nickname') nickname: string,
    @Req() req: Request
  ) {
    const user_id = req.user['sub']

    return this.usersService.findUsersByNickname(
      nickname,
      user_id
    )
  }
}
