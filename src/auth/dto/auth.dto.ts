import {
  IsDateString,
  IsNotEmpty,
  IsString,
  MaxLength
} from 'class-validator'

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  real_name: string
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  nick_name: string

  @IsDateString()
  @IsNotEmpty()
  birthday_date: Date

  @IsString()
  @IsNotEmpty()
  password: string
}
