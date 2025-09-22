import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class User {
  @ApiProperty({
    description: 'user id',
    example: '123',
    type: String,
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Email address ',
    example: 'john@example.com',
    type: String,
  })
  @IsString()
  email: string;

  @Exclude()
  password: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    type: String,
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user (nullable)',
    example: 'Doe',
    type: String,
    nullable: true,
  })
  @IsString()
  lastName: string | null;

  @ApiProperty({
    description: 'Date and time when the user was created',
    example: '2025-01-01T00:00:00Z',
    type: Date,
    format: 'date-time',
  })
  createAt: Date;

  @ApiProperty({
    description: 'Last update timestamp for the user',
    example: '2025-07-01T16:55:00Z',
    type: Date,
    format: 'date-time',
  })
  updateAt: Date;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }
}
