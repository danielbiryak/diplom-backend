import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { PostController as PostsController } from './posts.controller'
import { PostsService } from './posts.service'

@Module({
  imports: [PrismaModule],
  providers: [PostsService],
  controllers: [PostsController]
})
export class PostModule {}
