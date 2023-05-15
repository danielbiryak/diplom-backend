import { IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  nick_name: string

  @IsString()
  @IsNotEmpty()
  password: string
}
