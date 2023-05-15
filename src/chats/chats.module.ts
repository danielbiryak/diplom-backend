import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ChatsGateway } from './chats.gateway'
import { ChatsService } from './chats.service'

@Module({
  imports: [PrismaModule],
  providers: [ChatsGateway, ChatsService]
})
export class ChatsModule {}
