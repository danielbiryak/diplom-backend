import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested
} from 'class-validator'

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  title: string

  @IsString()
  @IsNotEmpty()
  text_content: string

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UsersFeedback)
  properties?: UsersFeedback[]
}

export class UsersFeedback {
  @IsString()
  @IsNotEmpty()
  property: string
  @IsNotEmpty()
  @IsNumber()
  @Max(1)
  @Min(0)
  score: number
}
