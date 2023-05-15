import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from 'src/prisma/prisma.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AtStrategy, RtStrategy } from './strategies'

@Module({
  imports: [
    JwtModule.register({ global: true }),
    PrismaModule
  ],
  controllers: [AuthController],
  providers: [AuthService, RtStrategy, AtStrategy]
})
export class AuthModule {}
