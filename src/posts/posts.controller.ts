import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { CreatePostDto } from './dto/createPost.dto'
import { PostsService } from './posts.service'

@Controller('posts')
export class PostController {
  constructor(private postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  createPost(
    @Req() req: Request,
    @Body() dto: CreatePostDto
  ) {
    const { user } = req

    console.log(dto.properties)

    return this.postsService.createPost(
      user['sub'],
      dto
    )
  }
  @Post('like-post')
  @UseGuards(AuthGuard('jwt'))
  likePost(
    @Req() req: Request,
    @Body('post_id')
    post_id: string
  ) {
    const user_id: string = req.user['sub']

    return this.postsService.likePost(user_id, post_id)
  }

  @Post('summarize')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  summarize(
    @Body('post_text')
    post_text: string
  ) {
    return this.postsService.summarize(post_text)
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getUserPostsByJwtOwner(
    @Req() req: Request,
    @Query()
    metadata: { page: string; limit: string }
  ) {
    const { user } = req

    const { page, limit } = metadata

    return this.postsService.getUserPosts(
      user['sub'],
      user['sub'],
      parseInt(page ?? '1'),
      parseInt(limit ?? '10')
    )
  }

  @Get('/:user_id')
  @UseGuards(AuthGuard('jwt'))
  getUserPosts(
    @Param('user_id') user_id: string,
    @Query()
    metadata: { page: string; limit: string },
    @Req() req: Request
  ) {
    const { page, limit } = metadata
    const jwt_user_id = req.user['sub']

    return this.postsService.getUserPosts(
      jwt_user_id,
      user_id,
      parseInt(page ?? '1'),
      parseInt(limit ?? '10')
    )
  }

  @Delete('/:post_id')
  @UseGuards(AuthGuard('jwt'))
  deletePost(
    @Req() req: Request,
    @Param('post_id') post_id: string
  ) {
    const user_id = req.user['sub']

    return this.postsService.deletePost(
      user_id,
      post_id
    )
  }
}
