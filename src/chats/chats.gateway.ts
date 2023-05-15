import { JwtService } from '@nestjs/jwt'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ChatsService } from './chats.service'
import { JwtPayload } from './types/jwtPayload.type'

@WebSocketGateway()
// @UseGuards(ChatGuard)
export class ChatsGateway
  implements
    OnGatewayDisconnect<Socket>,
    OnGatewayConnection<Socket>
{
  constructor(
    private jwtService: JwtService,
    private chatsService: ChatsService
  ) {}

  @WebSocketServer()
  server: Server

  async handleConnection(client: Socket) {
    if (
      this.ConnectionGuard(
        client.handshake.headers.authorization,
        client
      )
    )
      return
    const token_info = this.decodeToken(
      client.handshake.headers.authorization
    )

    if (
      !(await this.chatsService.setSocketId(
        client.id,
        token_info.sub
      ))
    ) {
      client.disconnect(true)
      return
    }
    console.log(
      'FIRST TIME HEADER',
      client.handshake.headers.first_time
    )

    if (
      client.handshake.headers.first_time !== 'true'
    ) {
      await this.sendPreviewMessages(
        token_info.sub,
        client.id
      )
    }

    console.log('handleConnection::' + client.id)
  }
  async handleDisconnect(client: Socket) {
    const user = this.jwtService.decode(
      client.handshake.headers.authorization.split(
        ' '
      )[1]
    )
    await this.chatsService.removeSocketId(user['sub'])

    console.log('disconnected', client.id)
  }

  private async sendPreviewMessages(
    userId: string,
    webSocketId: string
  ) {
    const messages =
      await this.chatsService.getPreviewMessages(
        userId
      )

    this.server
      .to(webSocketId)
      .emit('previewMessages', { messages })
  }

  private decodeToken(token: string) {
    const decoded_info: JwtPayload = JSON.parse(
      JSON.stringify(
        this.jwtService.decode(token.split(' ')[1])
      )
    )
    return decoded_info
  }

  private ConnectionGuard(
    token: string,
    socket: Socket
  ) {
    if (!token) {
      socket.disconnect(true)
      return true
    }
    const pureToken = token.split(' ')[1]
    const token_info =
      this.jwtService.decode(pureToken)

    if (token_info['exp'] < Date.now() / 1000) {
      socket.disconnect(true)
      return true
    }
    return false
  }

  @SubscribeMessage('send_first20_messages')
  async sendFirstMessages(
    @MessageBody('dialog_partner')
    dialog_partner: string,
    @ConnectedSocket() socket: Socket
  ) {
    const user = this.decodeToken(
      socket.handshake.headers.authorization
    )
    console.log('sendFirstMessages::', user)

    const messages =
      await this.chatsService.sendDialogMessages(
        user.sub,
        dialog_partner,
        1,
        20
      )
    this.server
      .to(socket.id)
      .emit('once_get_messages', messages)
  }

  @SubscribeMessage('new_message')
  onNewMessage(@MessageBody() body: any) {
    console.log('CRINGA', body)
  }

  @SubscribeMessage('send_message_to')
  async sendMessageTo(
    @MessageBody('dialog_partner')
    dialog_partner: string,
    @MessageBody('message') message: string,
    @MessageBody('createdAt') createdAt: string,
    @ConnectedSocket() client: Socket
  ) {
    const user = this.decodeToken(
      client.handshake.headers.authorization
    )

    const message_info =
      await this.chatsService.sendMessageTo(
        dialog_partner,
        user.sub,
        message,
        createdAt
      )
    if (message_info.socketId !== null)
      this.server
        .to(message_info.socketId)
        .emit('new_message', {
          id: message_info.id,
          owner: false,
          message: message_info.message,
          createdAt: message_info.createdAt
        })
  }

  @SubscribeMessage('get_more_messages')
  async getMoreMessages(
    @MessageBody('dialog_partner')
    dialog_partner: string,
    @MessageBody('page')
    page: number,
    @MessageBody('limit')
    limit: number,
    @ConnectedSocket() socket: Socket
  ) {
    const user = this.decodeToken(
      socket.handshake.headers.authorization
    )

    const messages =
      await this.chatsService.sendDialogMessages(
        user.sub,
        dialog_partner,
        page,
        limit
      )

    this.server
      .to(socket.id)
      .emit('get_messages', messages)
  }
}
