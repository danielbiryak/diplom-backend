import {
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable
} from '@nestjs/common'
import { Post } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreatePostDto } from './dto/createPost.dto'

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(
    owner_id: string,
    dto: CreatePostDto
  ) {
    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        text_content: dto.text_content,
        owner_id
      }
    })
    if (dto.properties) {
      const data = dto.properties.map((item) => {
        return {
          post_id: post.id,
          property: item.property,
          score: item.score
        }
      })

      await this.prisma.usersFeedback.createMany({
        data
      })
    }

    const new_post = await this.prisma.post.findUnique(
      {
        where: {
          id: post.id
        },
        include: { UsersFeedback: true }
      }
    )
    return { post: new_post }
  }

  async getUserPosts(
    jwt_user_id: string,
    user_id: string,
    page: number,
    limit: number
  ) {
    const skip = limit * (page - 1)
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ nick_name: user_id }, { id: user_id }]
      }
    })
    if (!user)
      throw new HttpException(
        'There is no user with this id',
        HttpStatus.NOT_FOUND
      )

    const posts = await this.prisma.post.findMany({
      where: { owner_id: user.id },
      include: {
        UsersFeedback: true
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
    const total_count_posts =
      await this.prisma.post.count({
        where: {
          owner_id: user.id
        }
      })
    const result_posts = await Promise.all(
      posts.map(async (post) => {
        const likes_count =
          await this.prisma.postLike.count({
            where: {
              post_id: post.id
            }
          })

        const like = await this.prisma.postLike.count({
          where: {
            post_id: post.id,
            user_id: jwt_user_id
          }
        })
        const isLiked = like === 1 ? true : false

        return { ...post, likes_count, isLiked }
      })
    )

    return {
      total: total_count_posts,
      page,
      limit,
      posts: result_posts
    }
  }

  async likePost(user_id: string, post_id: string) {
    const [post, user] = await Promise.all([
      this.prisma.post.findUnique({
        where: { id: post_id }
      }),
      this.prisma.user.findUnique({
        where: { id: user_id }
      })
    ])
    if (!post)
      throw new HttpException(
        'Post with this id is not found',
        HttpStatus.NOT_FOUND
      )

    const postLike =
      await this.prisma.postLike.findFirst({
        where: {
          post_id: post.id,
          user_id: user.id
        }
      })
    console.log('postlike', postLike)

    if (postLike) {
      const deletedLike =
        await this.prisma.postLike.delete({
          where: {
            id: postLike.id
          }
        })

      return { deletedLike }
    } else {
      const likePost =
        await this.prisma.postLike.create({
          data: {
            post_id: post.id,
            user_id: user.id
          }
        })

      return { likedPost: likePost }
    }
  }

  async deletePost(user_id: string, post_id: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: post_id,
        owner_id: user_id
      }
    })
    if (!post)
      throw new HttpException(
        'Post with this id is not found or you are not owner',
        HttpStatus.NOT_FOUND
      )
    await Promise.all([
      this.prisma.post.deleteMany({
        where: {
          id: post_id,
          owner_id: user_id
        }
      }),
      this.prisma.postLike.deleteMany({
        where: {
          post_id
        }
      })
    ])

    return { message: 'Post deleted successfully' }
  }
}
