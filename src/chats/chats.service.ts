import { Injectable } from '@nestjs/common'
import { ChatMessage } from '@prisma/client'
import { Socket } from 'socket.io'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  async setSocketId(
    webSocketId: string,
    userId: string
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    })
    if (!user) return false

    await this.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        socketId: webSocketId
      }
    })
    return true
  }
  async removeSocketId(userId: string) {
    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        socketId: null
      }
    })
    return
  }

  async getPreviewMessages(userId: string) {
    const sender_messages =
      await this.prisma.chatMessage.findMany({
        where: {
          senderId: userId
        },
        distinct: ['receiverId'],
        orderBy: {
          createdAt: 'desc'
        }
      })
    const reciver_messages =
      await this.prisma.chatMessage.findMany({
        where: {
          receiverId: userId
        },
        distinct: ['senderId'],
        orderBy: {
          createdAt: 'desc'
        }
      })

    const skip_id = []
    const all_messages = [
      ...sender_messages,
      ...reciver_messages
    ]

    const result_messages: ChatMessage[] = []
    for (let message of all_messages) {
      if (skip_id.includes(message.id)) continue

      const temp_messages = all_messages.filter(
        (val) =>
          (message.senderId === val.receiverId &&
            message.receiverId === val.senderId) ||
          (message.receiverId === val.receiverId &&
            message.senderId === val.senderId)
      )
      if (temp_messages.length === 2) {
        skip_id.push(temp_messages[0].id)
        skip_id.push(temp_messages[1].id)

        const temp =
          temp_messages[0].createdAt >
          temp_messages[1].createdAt
            ? temp_messages[0]
            : temp_messages[1]

        result_messages.push(temp)
      } else {
        skip_id.push(temp_messages[0])
        result_messages.push(temp_messages[0])
      }
    }
    const _result = result_messages.sort((a, b) => {
      if (a.createdAt > b.createdAt) return -1
      else return 1
    })

    const result = await Promise.all(
      _result.map(async (val) => {
        if (val.receiverId === userId) {
          const user =
            await this.prisma.user.findFirst({
              where: {
                id: val.senderId
              }
            })

          return {
            ...val,
            nickname: user.nick_name,
            dialog_partner: val.senderId
          }
        }
        const user = await this.prisma.user.findFirst({
          where: {
            id: val.receiverId
          }
        })
        return {
          ...val,
          nickname: user.nick_name,
          dialog_partner: val.receiverId
        }
      })
    )

    return result
  }

  async sendDialogMessages(
    owner_id: string,
    dialog_partner: string,
    page: number,
    limit: number
  ) {
    const skip = limit * (page - 1)

    const messages =
      await this.prisma.chatMessage.findMany({
        where: {
          OR: [
            {
              receiverId: owner_id,
              senderId: dialog_partner
            },
            {
              receiverId: dialog_partner,
              senderId: owner_id
            }
          ]
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      })

    const result = messages.map((message) => {
      const owner = message.senderId === owner_id
      return {
        id: message.id,
        owner,
        message: message.message,
        createdAt: message.createdAt
      }
    })
    const total_count_messages =
      await this.prisma.chatMessage.count({
        where: {
          OR: [
            {
              receiverId: owner_id,
              senderId: dialog_partner
            },
            {
              receiverId: dialog_partner,
              senderId: owner_id
            }
          ]
        }
      })
    return {
      messages: result,
      count: total_count_messages
    }
  }
  async sendMessageTo(
    receiverId: string,
    senderId: string,
    message: string,
    createdAt: string
  ) {
    const receiver_user =
      await this.prisma.user.findUnique({
        where: {
          id: receiverId
        }
      })
    const created_message =
      await this.prisma.chatMessage.create({
        data: {
          message,
          receiverId: receiver_user.id,
          senderId,
          createdAt: new Date(createdAt)
        }
      })

    return {
      ...created_message,
      socketId: receiver_user.socketId
    }
  }
}
