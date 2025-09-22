import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResultDto<T> {
  @IsNotEmpty()
  @IsObject()
  @ApiProperty()
  items!: T[];

  constructor(result: ResultDto<T>) {
    this.items = result.items;
  }
}

export class PaginationRequestDto {
  @IsOptional()
  @ApiPropertyOptional({
    type: 'string',
    name: 'orderBy',
    enum: ['id', 'title'],
    description: 'Campo ordinamento – valori ammessi: id, title',
    default: 'id',
  })
  orderBy?: 'id' | 'title' = 'id';

  @IsOptional()
  @ApiPropertyOptional({
    type: 'string',
    name: 'sortOrder',
    enum: ['asc', 'desc'],
    description: 'Direzione di ordinamento – valori ammessi: asc, desc',
    default: 'asc',
  })
  sortOrder?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({
    description: 'Offset per la paginazione',
    default: 0,
    type: Number,
  })
  offset: number = 0;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Limite di risultati per pagina',
    default: 10,
    minimum: 1,
    maximum: 500,
  })
  @IsInt()
  @Max(500)
  @Min(1)
  limit: number = 10;
}
export class DateRangeDto {
  @IsOptional()
  @ApiPropertyOptional({ type: 'string', name: 'from' })
  from?: string;
  to!: string;
}

export class ListTaskRequestDto extends PaginationRequestDto {
  @IsOptional()
  @ApiPropertyOptional({ type: 'string', name: 'status' })
  status?: string;
  @IsOptional()
  @ApiPropertyOptional({ type: 'string', name: 'title' })
  title?: string;
  @IsOptional()
  @ApiPropertyOptional({ type: 'string', name: 'date' })
  createdAt?: DateRangeDto;
}
export class PaginatedResultDto<T> extends ResultDto<T> {
  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  limit!: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  offset!: number;

  @IsBoolean()
  @ApiProperty()
  hasMore!: boolean;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  totalCount!: number;

  constructor(result: PaginatedResultDto<T>) {
    super(result);
    this.limit = result.limit;
    this.offset = result.offset;
    this.hasMore = result.hasMore;
    this.totalCount = result.totalCount;
  }
}
