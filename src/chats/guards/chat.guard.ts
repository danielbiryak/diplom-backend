import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { WsException } from '@nestjs/websockets'
import { Observable } from 'rxjs'

@Injectable()
export class ChatGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const authorization: string =
      request['handshake']['headers']['authorization']
    if (!authorization)
      throw new WsException('Something went wrong')
    console.log(authorization.split(' '))
    const token = authorization.split(' ')[1]
    const user = this.jwtService.decode(token)
    console.log(
      'USER::',
      JSON.stringify(user, null, 2)
    )

    return true
  }
}
