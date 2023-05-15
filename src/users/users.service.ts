import {
  HttpException,
  HttpStatus,
  Injectable
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findUsersByNickname(
    part_of_nickname: string,
    owner_of_request: string
  ) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          {
            nick_name: {
              startsWith:
                part_of_nickname[0].toUpperCase() +
                part_of_nickname.slice(
                  1,
                  part_of_nickname.length
                )
            }
          },
          {
            nick_name: {
              startsWith:
                part_of_nickname[0].toLowerCase() +
                part_of_nickname.slice(
                  1,
                  part_of_nickname.length
                )
            }
          }
        ],
        id: {
          notIn: [owner_of_request]
        }
      },
      select: {
        id: true,
        nick_name: true,
        real_name: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    if (users[0] == null)
      throw new HttpException(
        'User with this nickname are not found',
        HttpStatus.NOT_FOUND
      )

    return { users }
  }
}
