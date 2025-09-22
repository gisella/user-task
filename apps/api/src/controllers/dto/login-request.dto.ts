import { IsDefined, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsSolidPassword } from '../../decorators/is-solid-password.decorator';

export class LoginRequestDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'mbianchi@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password',
    example: 'Password@1',
  })
  @IsSolidPassword()
  @IsNotEmpty()
  @IsDefined()
  password: string;
}
