import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class User {
  @ApiProperty()
  @IsString()
  id: string;

  @IsString()
  @ApiProperty()
  email: string;

  @Exclude()
  password: string;

  @IsString()
  @ApiProperty()
  firstName: string;
  @IsString()
  @ApiProperty()
  lastName: string | null;
  @IsString()
  createAt: Date;
  @IsString()
  updateAt: Date;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }
}
