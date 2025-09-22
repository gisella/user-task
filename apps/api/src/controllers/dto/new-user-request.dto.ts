import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsDefined,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsSolidPassword } from '../../decorators/is-solid-password.decorator';
import { User } from '@app/core/user';

export class NewUserRequestDto {
  @ApiProperty({
    description: 'First name of the user',
    example: 'Mario',
  })
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  firstName: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Last name of the user',
    example: 'Bianchi',
  })
  lastName?: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'mbianchi@example.com',
  })
  @IsDefined({ message: 'email is required' })
  @IsString({ message: 'email must be a string' })
  @IsNotEmpty({ message: 'email should not be empty' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Password',
    example: 'Password@1',
  })
  @IsSolidPassword()
  @IsNotEmpty()
  @IsDefined()
  password: string;

  toUser(): User {
    return new User({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
    });
  }
}
